from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from langchain_community.utilities import SQLDatabase
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from config import DB_CONFIG
from db import query_all
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

search_bp = Blueprint('search', __name__)

# Build MySQL URI from your config
DATABASE_URI = f"mysql+mysqlconnector://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}/{DB_CONFIG['database']}"

db = SQLDatabase.from_uri(DATABASE_URI)

llm = ChatOllama(
    model="qwen2.5-coder:1.5b",
    temperature=0,
    num_ctx=4096,
)

# Description
SCHEMA_DESCRIPTION = """
You are a SQL expert for MySQL. Generate ONLY the SQL query, nothing else.

Database: company_db
Table: employees

Columns:
* id (INT) - Primary key
* name (VARCHAR) - Employee full name
* gender (VARCHAR) - 'Male' or 'Female'
* age (INT) - Age in years
* department (VARCHAR) - Department name (Engineering, Sales, HR, Marketing, Finance)
* position (VARCHAR) - Seniority level (Junior, Mid-Level, Senior, Lead, Manager)
* job_role (VARCHAR) - Job title (Developer, Analyst, Designer, Tester, etc.)
* location (VARCHAR) - City name (Pune, Mumbai, Bangalore, Delhi, Hyderabad, Chennai)
* salary (INT) - Annual salary in INR
* experience_years (INT) - Years of experience
* email (VARCHAR) - Email address

Rules:
1. Always use SELECT * FROM employees WHERE ...
2. Salary: 1 lakh = 100000, 5 lakh = 500000, 10 lakh = 1000000
3. Use LIKE for text matching: job_role LIKE '%Developer%'
4. Return ONLY the SQL query
5. No explanations, no markdown, no comments
6. End with semicolon

Examples:
Query: all females with salary above 5 lakh
SQL: SELECT * FROM employees WHERE gender = 'Female' AND salary > 500000;

Query: senior developers in Pune
SQL: SELECT * FROM employees WHERE position = 'Senior' AND job_role LIKE '%Developer%' AND location = 'Pune';

Query: top 10 highest paid
SQL: SELECT * FROM employees ORDER BY salary DESC LIMIT 10;

Generate SQL for this query:
"""


def create_text_to_sql_chain():
    """Create LangChain chain for text-to-SQL conversion"""
    sql_generation_prompt = PromptTemplate.from_template(
        SCHEMA_DESCRIPTION + "\nQuery: {question}\nSQL:"
    )
    
    sql_chain = (
        RunnablePassthrough.assign(question=lambda x: x["question"])
        | sql_generation_prompt
        | llm
        | StrOutputParser()
    )
    
    return sql_chain


def clean_sql_query(sql: str) -> str:
    """Clean and validate generated SQL"""
    # Remove markdown code blocks and formatting
    sql = re.sub(r'```(?:sql)?', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'```', '', sql)
    
    # Remove common prefixes
    sql = re.sub(r'^(SQL:|Query:|Answer:)\s*', '', sql, flags=re.IGNORECASE)
    
    # Get first line if multiple lines (sometimes LLMs add explanations)
    lines = [line.strip() for line in sql.split('\n') if line.strip()]
    if lines:
        for line in lines:
            if line.upper().startswith('SELECT'):
                sql = line
                break
        else:
            sql = lines[0]
    
    sql = sql.strip()
    
    # Remove trailing explanation after semicolon
    if ';' in sql:
        sql = sql.split(';')[0] + ';'
    elif not sql.endswith(';'):
        sql += ';'
    
    # Block dangerous keywords
    dangerous_keywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE', 'TRUNCATE', 'EXEC', 'EXECUTE']
    sql_upper = sql.upper()
    
    for keyword in dangerous_keywords:
        # Check for whole word match
        if re.search(r'\b' + keyword + r'\b', sql_upper):
            raise ValueError(f"Dangerous SQL keyword detected: {keyword}")
    
    if not sql_upper.startswith('SELECT'):
        raise ValueError("Only SELECT queries are allowed")
    
    logger.info(f"✅ Cleaned SQL: {sql}")
    return sql


def execute_sql_with_retry(sql: str, max_retries: int = 2):
    """
    Execute SQL using your existing db.py query_all function
    This returns actual dict results, not strings
    """
    for attempt in range(max_retries):
        try:
            logger.info(f"Executing (attempt {attempt + 1}): {sql}")
            
            result = query_all(sql.rstrip(';'))
            
            logger.info(f"Query successful, got {len(result)} rows")
            return result, sql
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"SQL error: {error_msg}")
            
            if attempt < max_retries - 1:
                correction_prompt = f"""
                This SQL query failed: {sql}
                
                Error: {error_msg}
                
                Database: MySQL, Table: employees
                
                Generate a corrected SQL query that fixes the error.
                Return ONLY the SQL query, nothing else.
                """
                
                try:
                    corrected_sql = llm.invoke(correction_prompt).content
                    sql = clean_sql_query(corrected_sql)
                    logger.info(f"🔧 Retrying with corrected SQL: {sql}")
                except Exception as correction_error:
                    logger.error(f"Failed to generate correction: {correction_error}")
                    raise Exception(f"Query failed: {error_msg}")
            else:
                raise Exception(f"Query failed after {max_retries} attempts: {error_msg}")
    
    return [], sql


@search_bp.route('/search', methods=['POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def search_employees():
    """
    Natural language search endpoint
    
    Request body:
    {
        "prompt": "all females with salary above 5 lakh",
        "explain": false  // optional: show generated SQL
    }
    
    Response:
    {
        "query": "original prompt",
        "count": 10,
        "results": [...employee records...],
        "generated_sql": "SELECT * FROM ..."  // if explain=true
    }
    """
    try:
        if request.method == 'OPTIONS':
            return jsonify({"status": "ok"}), 200
        
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({"error": "prompt field is required"}), 400
        
        prompt = data.get('prompt', '').strip()
        explain = data.get('explain', False)
        
        if not prompt:
            return jsonify({"error": "prompt cannot be empty"}), 400
        
        logger.info(f"🔍 Query: '{prompt}'")
        
        # Step 1: Generate SQL using LLM
        sql_chain = create_text_to_sql_chain()
        generated_sql = sql_chain.invoke({"question": prompt})
        
        logger.info(f"🤖 Generated SQL: {generated_sql}")
        
        # Step 2: Clean and validate
        cleaned_sql = clean_sql_query(generated_sql)
        
        # Step 3: Execute with your db.py (returns list of dicts)
        results, final_sql = execute_sql_with_retry(cleaned_sql)
        
        # Step 4: Build response
        response = {
            "success": True,
            "query": prompt,
            "count": len(results),
            "results": results
        }
        
        if explain:
            response["generated_sql"] = final_sql
        
        logger.info(f"✅ Returning {response['count']} results")
        
        return jsonify(response), 200
        
    except ValueError as e:
        logger.error(f"⚠️  Validation error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "type": "validation_error"
        }), 400
        
    except Exception as e:
        logger.error(f"❌ Search failed: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "type": "execution_error"
        }), 500


@search_bp.route('/search/examples', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_examples():
    """Get example natural language queries"""
    examples = [
        {
            "prompt": "all females with salary above 5 lakh",
            "description": "Filter by gender and salary"
        },
        {
            "prompt": "senior developers in Pune with 5+ years experience",
            "description": "Multiple conditions"
        },
        {
            "prompt": "employees in Sales department earning more than 8 lakh",
            "description": "Department and salary filter"
        },
        {
            "prompt": "all managers in Mumbai or Bangalore",
            "description": "Location with OR condition"
        },
        {
            "prompt": "junior engineers under 30 years old",
            "description": "Age-based filtering"
        },
        {
            "prompt": "top 10 highest paid employees",
            "description": "Sorting and limiting"
        },
        {
            "prompt": "employees with salary between 6 to 10 lakh",
            "description": "Range queries"
        },
        {
            "prompt": "HR employees with more than 3 years experience",
            "description": "Department and experience"
        },
        {
            "prompt": "female managers in Engineering department",
            "description": "Gender, role, and department"
        },
        {
            "prompt": "developers in Bangalore earning above 12 lakh",
            "description": "Role, location, and high salary"
        }
    ]
    
    return jsonify({"examples": examples}), 200


@search_bp.route('/search/status', methods=['GET'])
@cross_origin(supports_credentials=True)
def search_status():
    """Check system status"""
    try:
        # Test database connection
        test_query = "SELECT COUNT(*) as count FROM employees"
        result = query_all(test_query)
        employee_count = result[0]['count'] if result else 0
        
        return jsonify({
            "status": "operational",
            "model": "qwen2.5-coder:1.5b",
            "database": "MySQL",
            "database_name": DB_CONFIG['database'],
            "employee_count": employee_count,
            "llm_provider": "Ollama (local)",
            "estimated_response_time": "2-5 seconds"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@search_bp.route('/search/schema', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_schema():
    """View database schema"""
    try:
        # Get table structure
        schema_query = "DESCRIBE employees"
        schema = query_all(schema_query)
        
        # Get sample data
        sample_query = "SELECT * FROM employees LIMIT 3"
        sample_data = query_all(sample_query)
        
        return jsonify({
            "table": "employees",
            "database": DB_CONFIG['database'],
            "columns": schema,
            "sample_data": sample_data
        }), 200
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

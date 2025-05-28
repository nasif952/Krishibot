from neo4j import GraphDatabase
import openai
import os
from typing import List, Dict, Any, Optional

class AgricultureRAGSystem:
    """
    Bangladesh Agriculture RAG System
    Preserves the exact logic from the original final.py file
    """
    
    def __init__(self):
        # Load configuration from environment variables
        self.NEO4J_URI = os.getenv("NEO4J_URI")
        self.NEO4J_USERNAME = os.getenv("NEO4J_USERNAME") 
        self.NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
        self.NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        
        # Set OpenAI API key
        openai.api_key = self.OPENAI_API_KEY
        
        # Fulltext search indexes - preserved from original
        self.INDEXES = [
            "categoryFulltext",
            "cropNameFulltext", 
            "varietyNameFulltext",
            "stanNirbachonFulltext",
            "baponerShomoyFulltext",
            "beejChararHarFulltext",
            "rogBalaiDomanFulltext",
            "upojogiElakaFulltext",
            "boishisthoFulltext",
            "baponRoponerDurrottoFulltext",
            "marairShomoyFulltext",
            "antoporichorjaFulltext",
            "folonFulltext",
            "pokamakorFulltext",
            "pokamakorDomanFulltext",
            "rogBalaiFulltext",
            "sarBebosthaponaFulltext",
            "charaToriShomoyFulltext",
            "potNirbachonFulltext",
            "biseshUdyantattikBebosthaponaFulltext",
            "mediaFulltext"
        ]
        
        # Initialize Neo4j driver
        self.driver = GraphDatabase.driver(
            self.NEO4J_URI,
            auth=(self.NEO4J_USERNAME, self.NEO4J_PASSWORD),
            database=self.NEO4J_DATABASE
        )
        
        # Cache variety names for better performance
        self._variety_names_cache = None

    def get_all_variety_names(self) -> List[str]:
        """
        Fetch all unique variety names from the database dynamically
        Preserved from original final.py
        """
        if self._variety_names_cache is not None:
            return self._variety_names_cache
            
        with self.driver.session() as session:
            result = session.run("MATCH (n:`Variety Name`) RETURN DISTINCT n.`জাতের নাম` AS name")
            variety_names = [r["name"] for r in result if r["name"]]
            self._variety_names_cache = variety_names
            return variety_names

    def extract_variety_from_question(self, question: str, all_variety_names: List[str]) -> Optional[str]:
        """
        Looks up which variety is mentioned in the user's question
        Preserved from original final.py
        """
        for v in all_variety_names:
            if v and v in question:
                return v
        return None

    def filter_facts_by_variety(self, facts: List[Dict], variety_name: str) -> List[Dict]:
        """
        Filter facts by variety name
        Preserved from original final.py
        """
        filtered = []
        for fact in facts:
            if any(variety_name in str(v) for k, v in fact.items() if not k.startswith('_')):
                filtered.append(fact)
        return filtered

    def get_relevant_facts(self, user_query: str, top_n_each: int = 4) -> List[Dict]:
        """
        Get relevant facts using Neo4j fulltext search
        Preserved from original final.py
        """
        all_facts = []
        with self.driver.session() as session:
            for index_name in self.INDEXES:
                cypher_query = f"""
                CALL db.index.fulltext.queryNodes('{index_name}', $query)
                YIELD node, score
                RETURN node, score
                ORDER BY score DESC
                LIMIT $limit
                """
                try:
                    result = session.run(
                        cypher_query, 
                        {"query": user_query, "limit": top_n_each}
                    )
                    for r in result:
                        node = r["node"]
                        record = dict(node)
                        record["_index"] = index_name
                        record["_score"] = r["score"]
                        all_facts.append(record)
                except Exception as e:
                    print(f"Neo4j query failed for index {index_name}: {e}")
                    continue
        
        # Sort all results by score descending
        all_facts.sort(key=lambda x: x["_score"], reverse=True)
        return all_facts

    def is_broad_question(self, q: str) -> bool:
        """
        Heuristic for Bangla/English generic query words
        Preserved from original final.py
        """
        generic_keywords = [
            "সব", "সবগুলি", "সমস্ত", "ধরনের", "প্রকার", "varieties", "variety", "জাত", 
            "কিভাবে", "কেমন", "overall", "চাষ", "abadh", "production", "process", 
            "প্রসঙ্গ", "list", "enumerate", "ধাপ", "করব", "প্রয়োজন"
        ]
        return any(kw in q for kw in generic_keywords)

    def rag_answer(self, user_query: str, variety_list: List[str]) -> str:
        """
        Main RAG answer function - preserved exact logic from original final.py
        """
        # Step 1: Variety extraction
        variety_name = self.extract_variety_from_question(user_query, variety_list)
        facts = self.get_relevant_facts(user_query, top_n_each=5 if variety_name else 3)

        if variety_name:
            filtered_facts = self.filter_facts_by_variety(facts, variety_name)
            if not filtered_facts:
                filtered_facts = facts  # fallback to all results if nothing matches
            context = ""
            for fact in filtered_facts:
                display_props = ", ".join(f"{k}:{v}" for k, v in fact.items() if not k.startswith('_'))
                context += f"[{fact['_index']}, Score: {fact['_score']}]: {display_props}\n"
            cot_instruction = (
                f"Only answer using context blocks that mention the variety '{variety_name}'. "
                f"Do not use or mention other varieties in your answer. "
                f"Synthesize a precise answer summarizing all relevant information for that variety only."
            )
        else:
            # Broad/generic question
            context = ""
            for fact in facts:
                display_props = ", ".join(f"{k}:{v}" for k, v in fact.items() if not k.startswith('_'))
                context += f"[{fact['_index']}, Score: {fact['_score']}]: {display_props}\n"
            cot_instruction = (
                "Summarize all relevant information in the context for this broad query. "
                "If varieties or types are mentioned, list or compare them as appropriate."
            )

        print(" --------------- this is the context---------------------------------")
        print(context,"----------------------------------------------")
        print(" ----------------------------------------------")

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an AI assistant that answers questions using the provided context."},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {user_query}"}
            ]
        )
        return response.choices[0].message.content

    def get_rag_answer(self, user_query: str) -> str:
        """
        Public method to get RAG answer - maintains the original workflow
        """
        print(f"Processing query: {user_query}")
        
        # Load variety names (cached after first call)
        all_varieties = self.get_all_variety_names()
        print(f"Loaded {len(all_varieties)} variety names.")
        
        # Get answer using original logic
        answer = self.rag_answer(user_query, all_varieties)
        return answer

    def get_all_varieties(self) -> List[str]:
        """
        Public method to get all varieties for API endpoint
        """
        return self.get_all_variety_names()

    def close(self):
        """Close the Neo4j driver connection"""
        if self.driver:
            self.driver.close() 
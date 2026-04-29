import tree_sitter
import tree_sitter_python
import tree_sitter_typescript
import tree_sitter_javascript
import tree_sitter_go
from typing import Dict, Any, List

class IntentParser:
    """
    World-class AST parser using Tree-sitter.
    Normalizes multi-language source code into structural intent.
    """
    
    def __init__(self):
        # Initialize languages
        self.languages = {
            "python": tree_sitter.Language(tree_sitter_python.language()),
            "typescript": tree_sitter.Language(tree_sitter_typescript.language_typescript()),
            "tsx": tree_sitter.Language(tree_sitter_typescript.language_tsx()),
            "javascript": tree_sitter.Language(tree_sitter_javascript.language()),
            "go": tree_sitter.Language(tree_sitter_go.language()),
        }
        self.parser = tree_sitter.Parser()

    def parse_content(self, content: str, language: str) -> tree_sitter.Tree:
        """
        Parses raw content for a given language.
        """
        if language not in self.languages:
            raise ValueError(f"Language '{language}' not supported.")
        
        self.parser.language = self.languages[language]
        return self.parser.parse(bytes(content, "utf8"))

    def extract_structure(self, tree: tree_sitter.Tree) -> List[Dict[str, Any]]:
        """
        Extracts high-level structural components (classes, functions, imports).
        """
        root_node = tree.root_node
        components = []
        
        # Simple recursive walker to find interesting nodes
        # In a real scenario, this would use specialized queries (.scm files)
        def walk(node, parent_name=None):
            current_name = parent_name
            if node.type in ["class_definition", "function_definition", "method_definition", "interface_declaration"]:
                name_node = node.child_by_field_name("name")
                name = name_node.text.decode("utf8") if name_node else "anonymous"
                current_name = name
                
                components.append({
                    "type": node.type,
                    "name": name,
                    "parent": parent_name,
                    "start_line": node.start_point[0],
                    "end_line": node.end_point[0],
                })
            
            for child in node.children:
                walk(child, current_name)
        
        walk(root_node)
        return components

if __name__ == "__main__":
    # Test with a simple python snippet
    parser = IntentParser()
    test_code = """
class PaymentService:
    def process(self, amount: int):
        return f"Processing {amount}"

def health_check():
    return True
    """
    tree = parser.parse_content(test_code, "python")
    structure = parser.extract_structure(tree)
    print(f"Extracted Structure: {structure}")

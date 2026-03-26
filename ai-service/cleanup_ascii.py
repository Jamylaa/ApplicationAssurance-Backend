import os
import re
files = [
    r"c:\Users\benab\OneDrive\Desktop\ProjtVermeg\ai-service\chatbot\base_chatbot.py",
    r"c:\Users\benab\OneDrive\Desktop\ProjtVermeg\ai-service\chatbot\product_chatbot.py",
    r"c:\Users\benab\OneDrive\Desktop\ProjtVermeg\ai-service\chatbot\pack_chatbot.py",
    r"c:\Users\benab\OneDrive\Desktop\ProjtVermeg\ai-service\chatbot\garantie_chatbot.py",
    r"c:\Users\benab\OneDrive\Desktop\ProjtVermeg\ai-service\tests\test_product_chatbot.py",
    r"c:\Users\benab\OneDrive\Desktop\ProjtVermeg\ai-service\tests\test_pack_chatbot.py"
]
def to_ascii(content):
    # Mapping for common accented characters
    mapping = {
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'à': 'a', 'â': 'a',
        'î': 'i', 'ï': 'i',
        'ô': 'o',
        'û': 'u', 'ù': 'u',
        'ç': 'c',
        'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
        'À': 'A', 'Â': 'A',
        'Î': 'I', 'Ï': 'I',
        'Ô': 'O',
        'Û': 'U', 'Ù': 'U',
        'Ç': 'C'
    }
    for k, v in mapping.items():
        content = content.replace(k, v)
    
    # Remove any remaining non-ASCII characters (emojis, etc.)
    return content.encode('ascii', 'ignore').decode('ascii')

for file_path in files:
    if os.path.exists(file_path):
        print(f"Nettoyage de {file_path}...")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        clean_content = to_ascii(content)
        
        with open(file_path, 'w', encoding='ascii') as f:
            f.write(clean_content)
    else:
        print(f"Fichier non trouve : {file_path}")

print("Nettoyage termine.")

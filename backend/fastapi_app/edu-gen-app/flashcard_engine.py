# flashcard_engine.py
from pathlib import Path

def create_flashcards(qa_pairs, topic):
    path = f"outputs/{topic}_flashcards.txt"
    with open(path, "w", encoding="utf-8") as f:
        for q, a in qa_pairs:
            f.write(f"{q}\t{a}\n")
    return path
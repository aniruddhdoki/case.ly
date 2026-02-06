import random

class PlaceholderAgent:
    """Phase 1: Simple keyword-based responses. Will be replaced with real AI agent."""
    
    def process_turn(self, user_message: str, context: dict) -> dict:
        message_lower = user_message.lower()
        
        # Keyword-based responses
        if any(word in message_lower for word in ["question", "clarify", "clarification"]):
            response = "That's a great question. For this case, assume we're looking at the US market over the past 2 years. What else would you like to know?"
        
        elif any(word in message_lower for word in ["think", "moment", "minute"]):
            response = "Of course, take your time. I'm here when you're ready."
        
        elif any(word in message_lower for word in ["framework", "structure", "approach"]):
            response = "Interesting framework. Let's start by diving into the first element you mentioned. Can you walk me through your thinking there?"
        
        elif any(word in message_lower for word in ["revenue", "sales", "income"]):
            response = "Good thinking on the revenue side. What specific factors would you examine to understand the revenue decline?"
        
        elif any(word in message_lower for word in ["cost", "expense", "spending"]):
            response = "Yes, costs are definitely worth exploring. What cost categories would you want to break down?"
        
        elif any(word in message_lower for word in ["recommend", "recommendation", "suggest"]):
            response = "Those are solid recommendations. What would you prioritize as the most important next step?"
        
        else:
            responses = [
                "I see. Can you elaborate on that?",
                "Interesting point. Tell me more about your reasoning.",
                "Good observation. What else should we consider?",
                "That's one angle. What other factors might be at play?",
            ]
            response = random.choice(responses)
        
        return {"text": response}

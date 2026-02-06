from database import engine, Base, SessionLocal
from models import User, Case
import uuid

def init_database():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created")
    
    db = SessionLocal()
    
    try:
        # Create test user
        test_user = User(id=uuid.uuid4(), email="test@example.com", name="Test User")
        db.add(test_user)
        db.commit()
        print(f"✓ Test user created: {test_user.id}")
        
        # Create sample case
        sample_case = Case(
            id=uuid.uuid4(),
            title="Coffee Chain Profitability Decline",
            content={
                "problem_statement": "A national coffee chain has experienced a 15% decline in profitability over the past 2 years. The CEO has hired you to identify root causes and recommend solutions.",
                "guidance": "Guide candidate to structure as Revenue vs Cost analysis.",
                "ideal_framework": ["Revenue", "Costs", "Competition", "Operations"]
            },
            difficulty="beginner",
            case_type="profitability"
        )
        db.add(sample_case)
        db.commit()
        print(f"✓ Sample case created: {sample_case.id}")
        
        print("\n" + "="*50)
        print("Database initialized successfully!")
        print("="*50)
        print(f"\nTest User ID: {test_user.id}")
        print(f"Sample Case ID: {sample_case.id}")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()

from flask import Flask, jsonify, request
from flask_cors import CORS 
from config import Config
from models import db, InventoryItem, ShiftSurvey
from datetime import datetime
from dotenv import load_dotenv
import os
import json

load_dotenv() 
app = Flask(__name__)
app.config.from_object(Config)

CORS(app, origins=["https://myinventory-ten.vercel.app"])

@app.route('/')
def home():
    return {'message': 'Inventory API is running'}

@app.route('/api/init-db')
def init_db():
    with app.app_context():
        db.create_all()
    return {'success': True, 'message': 'Database created'}

@app.route('/api/items', methods=['GET'])
def get_items():
    items = InventoryItem.query.all()
    items_list = [item.to_dict() for item in items]
    
    return {
        'success': True,
        'count': len(items_list),
        'items': items_list
    }

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = InventoryItem.query.get(item_id)
    
    if not item:
        return {'success': False, 'error': 'Item not found'}, 404
    
    try:
        db.session.delete(item)
        db.session.commit()
        return {'success': True, 'message': 'Item deleted successfully'}
    except Exception as e:
        db.session.rollback()
        return {'success': False, 'error': str(e)}, 500
        
@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json()
    
    if not data or not data.get('name'):
        return {'success': False, 'error': 'Name is required'}, 400
    
    new_item = InventoryItem(
        name=data['name'],
        quantity=data.get('quantity', 0),
        activity=data.get('activity', ''),
        curriculum=data.get('curriculum', ''),
        location=data.get('location',''),
        min_quantity=data.get('min_quantity', 10),
        unit=data.get('unit', 'units'),
        notes=data.get('notes', '')
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return {
        'success': True,
        'message': 'Item created',
        'item': new_item.to_dict()
    }, 201
@app.route('/api/admin-login', methods=['POST'])
def admin_login():
    """Admin login with username/password"""
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    
    # Check against env variables
    if (username == os.getenv('ADMIN_USERNAME') and 
        password == os.getenv('ADMIN_PASSWORD')):
        return jsonify({
            'success': True,
            'user': {
                'name': 'Admin',
                'role': 'admin'
            }
        })
    
    return jsonify({
        'success': False,
        'error': 'Invalid credentials'
    }), 401

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.get_json()
    item = InventoryItem.query.get(item_id)
    
    if not item:
        return {'success': False, 'error': 'Item not found'}, 404
    
    if 'name' in data:
        item.name = data['name']
    if 'quantity' in data:
        item.quantity = data['quantity']
    if 'activity' in data:
        item.activity = data['activity']
    if 'curriculum' in data:
        item.curriculum = data['curriculum']
    if 'location' in data:
        item.location = data['location']
    if 'unit' in data:
        item.unit = data['unit']
    if 'notes' in data:
        item.notes = data['notes']
        item.notes_updated_at = datetime.utcnow() 
    
    db.session.commit()
    
    return {
        'success': True,
        'message': 'Item updated',
        'item': item.to_dict()
    }

@app.route('/api/surveys/draft', methods=['GET'])
def get_draft_survey():
    """Get instructor's incomplete survey"""
    instructor_name = request.args.get('instructor_name')
    today = datetime.now().date()
    
    # Find draft survey for today
    survey = ShiftSurvey.query.filter_by(
        instructor_first_name=instructor_name.split()[0] if instructor_name else '',
        status='draft'
    ).filter(ShiftSurvey.date >= today).first()
    
    if survey:
        return {'success': True, 'survey': survey.to_dict()}
    return {'success': False, 'survey': None}

@app.route('/api/surveys/draft', methods=['POST'])
def save_draft_survey():
    """Save/update draft survey"""
    try:
        data = request.get_json()
        print("Received data:", data)  # DEBUG
        
        survey_id = data.get('id')
        
        if survey_id:
            # Update existing draft
            survey = ShiftSurvey.query.get(survey_id)
            if not survey:
                print(f"Survey {survey_id} not found")  # DEBUG
                return {'success': False, 'error': 'Survey not found'}, 404
            print(f"Updating existing survey {survey_id}")  # DEBUG
        else:
            # Create new draft
            print("Creating new survey")  # DEBUG
            survey = ShiftSurvey()
            survey.status = 'draft'
            db.session.add(survey)
        
        # Update all fields
        survey.instructor_first_name = data.get('instructor_first_name', '')
        survey.instructor_last_name = data.get('instructor_last_name', '')
        
        date_str = data.get('date')
        if date_str:
            survey.date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            survey.date = datetime.now().date()
            
        survey.reviewed_task_list = data.get('reviewed_task_list', False)
        survey.checked_in = data.get('checked_in', False)
        survey.used_correct_materials = data.get('used_correct_materials', False)
        survey.gathered_materials = data.get('gathered_materials', False)
        survey.double_checked = data.get('double_checked', False)
        survey.labeled_bins = data.get('labeled_bins', False)
        survey.returned_bins = data.get('returned_bins', False)
        survey.packing_notes = data.get('packing_notes', '')
        survey.returned_all_items = data.get('returned_all_items', False)
        survey.shelves_clean = data.get('shelves_clean', False)
        survey.checked_low_stock = data.get('checked_low_stock', False)
        survey.logged_whiteboard = data.get('logged_whiteboard', False)
        survey.items_need_ordering = data.get('items_need_ordering', '')
        survey.low_stock_items = json.dumps(data.get('low_stock_items', []))
        survey.materials_correct_classroom = data.get('materials_correct_classroom', False)
        survey.took_picture = data.get('took_picture', False)
        survey.swept_floor = data.get('swept_floor', False)
        survey.removed_trash = data.get('removed_trash', False)
        survey.locked_storage = data.get('locked_storage', False)
        survey.checked_in_before_leaving = data.get('checked_in_before_leaving', False)
        survey.shift_notes = data.get('shift_notes', '')
        
        db.session.commit()
        
        print(f"Survey saved with ID: {survey.id}")  # DEBUG
        
        return {
            'success': True,
            'survey': survey.to_dict()
        }
    except Exception as e:
        db.session.rollback()
        print(f"Error saving draft: {str(e)}")  # DEBUG
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}, 500

@app.route('/api/surveys/<int:survey_id>/complete', methods=['POST'])
def complete_survey(survey_id):
    """Mark survey as completed"""
    survey = ShiftSurvey.query.get(survey_id)
    if not survey:
        return {'success': False, 'error': 'Survey not found'}, 404
    
    survey.status = 'completed'
    db.session.commit()
    
    return {'success': True, 'message': 'Survey completed'}
@app.route('/api/surveys', methods=['GET'])
def get_surveys():
    """Get all surveys (for admin)"""
    surveys = ShiftSurvey.query.order_by(ShiftSurvey.timestamp.desc()).all()
    return {
        'success': True,
        'count': len(surveys),
        'surveys': [survey.to_dict() for survey in surveys]
    }

@app.route('/api/surveys/<int:survey_id>', methods=['GET'])
def get_survey(survey_id):
    """Get specific survey details"""
    survey = ShiftSurvey.query.get(survey_id)
    if not survey:
        return {'success': False, 'error': 'Survey not found'}, 404
    return {'success': True, 'survey': survey.to_dict()}

@app.route('/api/stats')
def get_stats():
    """Get inventory statistics"""
    items = InventoryItem.query.all()
    
    # Count low stock items
    low_stock = sum(1 for item in items if item.to_dict()['is_low_stock'])
    
    # Group by activity
    activities = {}
    for item in items:
        if item.activity:
            activities[item.activity] = activities.get(item.activity, 0) + 1
    
    activity_list = [{'name': k, 'count': v} for k, v in activities.items()]
    activity_list.sort(key=lambda x: x['count'], reverse=True)
    
    return {
        'success': True,
        'stats': {
            'total_items': len(items),
            'low_stock_count': low_stock,
            'activities': activity_list
        }
    }

db.init_app(app)

if __name__ == '__main__':
    app.run(debug=True)
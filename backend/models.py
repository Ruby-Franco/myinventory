from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class InventoryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    activity = db.Column(db.String(200)) 
    curriculum = db.Column(db.String(200))
    location = db.Column(db.String(100))
    min_quantity = db.Column(db.Integer, default=10)
    unit = db.Column(db.String(20), default='units')
    notes = db.Column(db.Text)
    notes_updated_at = db.Column(db.DateTime)

    def to_dict(self):

        if self.unit == 'boxes':
            is_low = self.quantity <= 10
        else:  # otherwise it is individual units
            is_low = self.quantity <= 50

        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity, 
            'unit': self.unit,
            'activity': self.activity,
            'activity_tags': self.activity.split(',') if self.activity else [],
            'curriculum': self.curriculum,
            'location' : self.location,
            'is_low_stock': is_low,
            'notes': self.notes,
            'notes_updated_at' : self.notes_updated_at.isoformat() if self.notes_updated_at else None
        }
    
class ShiftSurvey(db.Model):
    __tablename__ = 'shift_survey'
    id = db.Column(db.Integer, primary_key=True)
    instructor_first_name = db.Column(db.String(200), nullable=False)
    instructor_last_name = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='draft')  # 'draft' or 'completed'
    

    reviewed_task_list = db.Column(db.Boolean, default=False)
    checked_in = db.Column(db.Boolean, default=False)

    used_correct_materials = db.Column(db.Boolean, default=False)
    gathered_materials = db.Column(db.Boolean, default=False)
    double_checked = db.Column(db.Boolean, default=False)
    labeled_bins = db.Column(db.Boolean, default=False)
    returned_bins = db.Column(db.Boolean, default=False)
    packing_notes = db.Column(db.Text)

    returned_all_items = db.Column(db.Boolean, default=False)
    shelves_clean = db.Column(db.Boolean, default=False)
    checked_low_stock = db.Column(db.Boolean, default=False)
    logged_whiteboard = db.Column(db.Boolean, default=False)

    items_need_ordering = db.Column(db.String(10))
    low_stock_items = db.Column(db.Text)

    materials_correct_classroom = db.Column(db.Boolean, default=False)
    took_picture = db.Column(db.Boolean, default=False)

    swept_floor = db.Column(db.Boolean, default=False)
    removed_trash = db.Column(db.Boolean, default=False)
    locked_storage = db.Column(db.Boolean, default=False)
    checked_in_before_leaving = db.Column(db.Boolean, default=False)

    shift_notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'instructor_first_name': self.instructor_first_name,
            'instructor_last_name': self.instructor_last_name,
            'date': self.date.isoformat() if self.date else None,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'status': self.status,
            'reviewed_task_list': self.reviewed_task_list,
            'checked_in': self.checked_in,
            'used_correct_materials': self.used_correct_materials,
            'gathered_materials': self.gathered_materials,
            'double_checked': self.double_checked,
            'labeled_bins': self.labeled_bins,
            'returned_bins': self.returned_bins,
            'packing_notes': self.packing_notes,
            'returned_all_items': self.returned_all_items,
            'shelves_clean': self.shelves_clean,
            'checked_low_stock': self.checked_low_stock,
            'logged_whiteboard': self.logged_whiteboard,
            'items_need_ordering': self.items_need_ordering,
            'low_stock_items': self.low_stock_items,
            'materials_correct_classroom': self.materials_correct_classroom,
            'took_picture': self.took_picture,
            'swept_floor': self.swept_floor,
            'removed_trash': self.removed_trash,
            'locked_storage': self.locked_storage,
            'checked_in_before_leaving': self.checked_in_before_leaving,
            'shift_notes': self.shift_notes
        }
class AdminUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username
        }
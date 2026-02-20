import { useState, useEffect } from 'react'
import '../index.css'
import { useNavigate } from 'react-router-dom'

function Dashboard() {

  //const API_URL = "https://stemnetics.pythonanywhere.com";
  //const API_URL = "http://127.0.0.1:5000";
  const API_URL = "myinventory-production.up.railway.app";
  
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    activity: '',
    curriculum: '',
    location: '',
    unit: 'units',
    notes: ''
  })
  const [editingItem, setEditingItem] = useState(null)  
  const userName = localStorage.getItem('userName')
  const userRole = localStorage.getItem('userRole')
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  
  // New state for tabs and surveys
  const [activeTab, setActiveTab] = useState('inventory')
  const [surveys, setSurveys] = useState([])
  const [surveySearchQuery, setSurveySearchQuery] = useState('')
  const [expandedSurvey, setExpandedSurvey] = useState(null)

  useEffect(() => {
    fetchItems()
    fetchStats()
    fetchSurveys()
  }, [])

  const fetchItems = () => {
    fetch(`${API_URL}/api/items`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }

  const fetchStats = () => {
    fetch(`${API_URL}/api/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data.stats)
      })
      .catch(err => console.error('Error:', err))
  }

  const fetchSurveys = () => {
    fetch(`${API_URL}/api/surveys`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const completedSurveys = data.surveys.filter(s => s.status === 'completed')
          setSurveys(completedSurveys)
        }
      })
      .catch(err => console.error('Error:', err))
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name, 
      quantity: item.quantity,
      activity: item.activity || '',
      curriculum: item.curriculum || '',
      location: item.location,
      unit: item.unit,
      notes: item.notes
    })
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    
    fetch(`${API_URL}/api/items/${editingItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchItems()
          fetchStats()
          setEditingItem(null)
          setFormData({ name: '', quantity: 0, activity: '', curriculum: '', location: '', unit: 'units', notes: ''})
        }
      })
      .catch(err => console.error('Error:', err))
  }

  const handleDelete = (itemId) => {
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) {
      return
    }
    
    fetch(`${API_URL}/api/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchItems()
          fetchStats()
          setEditingItem(null)
          setFormData({ name: '', quantity: 0, activity: '', curriculum:'', location: '', unit: 'units' , notes: '' })
          alert('Item deleted successfully')
        }
      })
      .catch(err => console.error('Error:', err))
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setFormData({ name: '', quantity: 0, activity: '', curriculum: '', location: '', unit: 'units', notes: '' })
  }

  const handleLogout = () => {
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    navigate('/')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    fetch(`${API_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchItems()
          fetchStats()
          setFormData({ name: '', quantity: 0, activity: '', curriculum: '', location: '' ,  unit: 'units' , notes: ''})
        }
      })
      .catch(err => console.error('Error:', err))
  }

  if (loading) {
    return <div className="p-8"> Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="text-right">
        <p className="text-sm text-gray-600">Welcome back,</p>
        <p className="text-lg font-semibold text-gray-800">{userName}</p>
        <p className="text-xs text-gray-500 capitalize">{userRole}</p>
        <button
          onClick={handleLogout}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Log out
        </button>
      </div>

      {/* Title and Tabs */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Admin Dashboard
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'inventory'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Inventory Management
          </button>
          <button
            onClick={() => setActiveTab('surveys')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'surveys'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            End of Shift Surveys
          </button>
        </div>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total_items}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
                <p className={`text-3xl font-bold mt-2 ${stats.low_stock_count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.low_stock_count}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Activities</p>
                <div className="mt-2">
                  {stats.activities.slice(0, 3).map((act, idx) => (
                    <p key={idx} className="text-sm text-gray-700">
                      {act.name}: <span className="font-semibold">{act.count}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>

            <form onSubmit={editingItem ? handleUpdate : handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Arduino Uno"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Curriculum</label>
                  <input
                    type="text"
                    value={formData.curriculum}
                    onChange={(e) => setFormData({...formData, curriculum: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Robotics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Activity</label>
                  <input
                    type="text"
                    value={formData.activity}
                    onChange={(e) => setFormData({...formData, activity: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Robotics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Bellflower"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="units">Individual Units</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes/Comments</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Add any notes about this item..."
                  />
                </div>
              </div>
                
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
        
                {editingItem && (
                  <>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(editingItem.id)}
                      className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                    >
                      Delete Item
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <input
              type="text"
              placeholder="Search items by name or activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold mb-4">Items ({items.length})</h2>
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  showLowStockOnly 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showLowStockOnly ? 'Show All Items' : 'Show Low Stock Only'}
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500">No items yet</p>
            ) : (
              <div className="space-y-2">
                {items
                  .filter(item => 
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.activity && item.activity.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .filter(item => !showLowStockOnly || item.is_low_stock)
                  .map(item => (
                    <div 
                      key={item.id} 
                      className={`pb-3 flex justify-between items-center px-3 py-2 rounded ${
                        item.is_low_stock ? 'bg-red-50 border border-red-300' : 'border-b'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          {item.is_low_stock && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                              LOW
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} {item.unit} | Curriculum: {item.curriculum || 'None'} | Activity: {item.activity || 'None'} | Location: {item.location || 'Not specified'} 
                        </p>
                        <p className="text-sm text-gray-600">
                          Notes: {item.notes || ''}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* SURVEYS TAB */}
      {activeTab === 'surveys' && (
        <>
          {/* Survey Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Surveys</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{surveys.length}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">This Week</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {surveys.filter(s => {
                  const surveyDate = new Date(s.date)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return surveyDate >= weekAgo
                }).length}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Items Need Ordering</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {surveys.filter(s => s.items_need_ordering === 'Yes').length}
              </p>
            </div>
          </div>

          {/* Surveys Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">All Surveys ({surveys.length})</h2>
            
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by instructor name..."
                value={surveySearchQuery}
                onChange={(e) => setSurveySearchQuery(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            {surveys.length === 0 ? (
              <p className="text-gray-500">No surveys submitted yet</p>
            ) : (
              <div className="space-y-2">
                {surveys
                  .filter(survey => {
                    const fullName = `${survey.instructor_first_name} ${survey.instructor_last_name}`.toLowerCase()
                    return fullName.includes(surveySearchQuery.toLowerCase())
                  })
                  .map(survey => (
                    <div key={survey.id} className="border rounded-lg">
                      {/* Survey Header */}
                      <div 
                        className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedSurvey(expandedSurvey === survey.id ? null : survey.id)}
                      >
                        <div>
                          <p className="font-semibold text-lg">
                            {survey.instructor_first_name} {survey.instructor_last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Date: {survey.date} | Submitted: {new Date(survey.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <button className="text-blue-600 font-medium">
                          {expandedSurvey === survey.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>

                      {/* Expanded Survey Details */}
                      {expandedSurvey === survey.id && (
                        <div className="px-4 py-4 bg-gray-50 border-t space-y-4">
                          
                          {/* Arrival Tasks */}
                          <div>
                            <h3 className="font-semibold mb-2">Arrival Tasks</h3>
                            <div className="space-y-1 text-sm">
                              <p>Reviewed task list: {survey.reviewed_task_list ? '✅' : '❌'}</p>
                              <p>Checked in: {survey.checked_in ? '✅' : '❌'}</p>
                            </div>
                          </div>

                          {/* Packing Materials */}
                          <div>
                            <h3 className="font-semibold mb-2">Packing Materials</h3>
                            <div className="space-y-1 text-sm">
                              <p>Used correct materials: {survey.used_correct_materials ? '✅' : '❌'}</p>
                              <p>Gathered materials: {survey.gathered_materials ? '✅' : '❌'}</p>
                              <p>Double-checked: {survey.double_checked ? '✅' : '❌'}</p>
                              <p>Labeled bins: {survey.labeled_bins ? '✅' : '❌'}</p>
                              <p>Returned bins: {survey.returned_bins ? '✅' : '❌'}</p>
                              {survey.packing_notes && (
                                <p className="text-gray-700 italic mt-2 bg-white p-2 rounded">
                                  <strong>Notes:</strong> {survey.packing_notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Organization & Inventory */}
                          <div>
                            <h3 className="font-semibold mb-2">Organization & Inventory</h3>
                            <div className="space-y-1 text-sm">
                              <p>Returned all items: {survey.returned_all_items ? '✅' : '❌'}</p>
                              <p>Shelves clean: {survey.shelves_clean ? '✅' : '❌'}</p>
                              <p>Checked low stock: {survey.checked_low_stock ? '✅' : '❌'}</p>
                              <p>Logged whiteboard: {survey.logged_whiteboard ? '✅' : '❌'}</p>
                              <p className="font-medium mt-2 bg-yellow-50 p-2 rounded">
                                Items need ordering? <strong>{survey.items_need_ordering}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Site Drop Off */}
                          <div>
                            <h3 className="font-semibold mb-2">Site Drop Off</h3>
                            <div className="space-y-1 text-sm">
                              <p>Materials in correct classroom: {survey.materials_correct_classroom ? '✅' : '❌'}</p>
                              <p>Took picture: {survey.took_picture ? '✅' : '❌'}</p>
                            </div>
                          </div>

                          {/* End of Shift */}
                          <div>
                            <h3 className="font-semibold mb-2">End of Shift Tasks</h3>
                            <div className="space-y-1 text-sm">
                              <p>Swept floor: {survey.swept_floor ? '✅' : '❌'}</p>
                              <p>Removed trash: {survey.removed_trash ? '✅' : '❌'}</p>
                              <p>Locked storage: {survey.locked_storage ? '✅' : '❌'}</p>
                              <p>Checked in before leaving: {survey.checked_in_before_leaving ? '✅' : '❌'}</p>
                            </div>
                          </div>

                          {/* Shift Notes */}
                          {survey.shift_notes && (
                            <div>
                              <h3 className="font-semibold mb-2">Shift Notes</h3>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                {survey.shift_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
export default Dashboard
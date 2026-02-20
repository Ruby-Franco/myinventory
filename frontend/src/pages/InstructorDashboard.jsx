import { useState, useEffect } from 'react'
import '../index.css'
import { useNavigate } from 'react-router-dom'

function InstructorDashboard() {

  //const API_URL = "https://stemnetics.pythonanywhere.com";
  //const API_URL = "http://127.0.0.1:5000";
  const API_URL = "myinventory-production.up.railway.app";

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const userName = localStorage.getItem('userName')
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
    fetchStats()
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

  const handleMarkLowStock = (item) => {
    const newQuantity = prompt(`Enter current quantity for ${item.name}:`, item.quantity)
    
    if (newQuantity === null) return // User canceled
    
    const quantity = parseInt(newQuantity)
    
    if (isNaN(quantity) || quantity < 0) {
      alert('Please enter a valid number')
      return
    }
    
    fetch(`${API_URL}/api/items/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchItems()
          fetchStats()
          alert(`${item.name} quantity updated to ${quantity}`)
        }
      })
      .catch(err => console.error('Error:', err))
  }

  const handleNext = () => {
     navigate('/instructor?page=3')
  }

  const handleLogout = () => {
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    navigate('/')
  }

  const handleBack = () => {
    // Navigate back to survey page 1
    navigate('/instructor')
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="text-right mb-4">
        <p className="text-sm text-gray-600">Logged in as: {userName}</p>
        <p className="text-xs text-gray-500">Instructor view</p>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Inventory Dashboard
      </h1>
      <p className="text-gray-600 mb-6">Page 2 of 3 - Update quantities for low stock items</p>


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

      {/* Items List - View Only with Mark Low Stock button */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Inventory Items ({items.length})</h2>
        <p className="text-sm text-gray-600 mb-4">
          You can view all items and mark items as low stock when supplies are running low.
        </p>
        
        {items.length === 0 ? (
          <p className="text-gray-500">No items yet</p>
        ) : (
          <div className="space-y-2">
            {items
                .filter(item => 
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.activity && item.activity.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(item => (
                  <div 
                  key={item.id} 
                  className={`pb-3 flex justify-between items-center px-3 py-2 rounded ${
                  item.is_low_stock ? 'bg-red-50 border border-red-300' : 'border-b' }`}
                  >
                  <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    {item.is_low_stock && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                        LOW STOCK
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} {item.unit} | Activity: {item.activity || 'None'} | Location: {item.location || 'None'}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 italic">
                      Notes: {item.notes}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => handleMarkLowStock(item)}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 whitespace-nowrap"
                >
                  {item.is_low_stock ? 'Update Quantity' : 'Mark Low Stock'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div style={{display: 'flex', gap: '1rem'}}>
            <button
              onClick={handleBack}
              style={{flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '1rem', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: '600', border: 'none', cursor: 'pointer'}}
            >
              Back to Page 1
            </button>
            <button
              onClick={handleNext}
              style={{flex: 2, backgroundColor: '#2563eb', color: 'white', padding: '1rem', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: '600', border: 'none', cursor: 'pointer'}}
            >
              Next
            </button>
        </div>
      </div>
     
    </div>
  )
}

export default InstructorDashboard
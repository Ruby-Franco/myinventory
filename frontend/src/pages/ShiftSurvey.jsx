import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ShiftSurvey.css'

function ShiftSurvey() {
  //const API_URL = "http://127.0.0.1:5000"
  const API_URL = "myinventory-production.up.railway.app";
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName')
  
  const [currentPage, setCurrentPage] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [surveyId, setSurveyId] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    instructor_first_name: '',
    instructor_last_name: '',
    date: new Date().toISOString().split('T')[0],
    reviewed_task_list: false,
    checked_in: false,
    used_correct_materials: false,
    gathered_materials: false,
    double_checked: false,
    labeled_bins: false,
    returned_bins: false,
    packing_notes: '',
    returned_all_items: false,
    shelves_clean: false,
    checked_low_stock: false,
    logged_whiteboard: false,
    items_need_ordering: '',
    materials_correct_classroom: false,
    took_picture: false,
    swept_floor: false,
    removed_trash: false,
    locked_storage: false,
    checked_in_before_leaving: false,
    shift_notes: ''
  })

  // Load draft survey on mount
  useEffect(() => {
    fetch(`${API_URL}/api/surveys/draft?instructor_name=${userName}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.survey) {
          setFormData(data.survey)
          setSurveyId(data.survey.id)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  // Auto-save when form data changes (debounced)
  useEffect(() => {
    if (loading) return
    
    const timer = setTimeout(() => {
      saveDraft()
    }, 1000) // Save 1 second after user stops typing
    
    return () => clearTimeout(timer)
  }, [formData])

  // Check which page to show based on URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const page = params.get('page')
    if (page === '3') setCurrentPage(3)
  }, [])

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => handleLogout(), 20000)
      return () => clearTimeout(timer)
    }
  }, [submitted])

  const saveDraft = () => {
    const payload = { ...formData }
    if (surveyId) payload.id = surveyId

    console.log('Saving draft with surveyId:', surveyId, 'Payload:', payload)

    fetch(`${API_URL}/api/surveys/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        console.log('Draft save response:', data)
        if (data.success) {
          if (!surveyId && data.survey && data.survey.id) {
            console.log('Setting surveyId to:', data.survey.id)
            setSurveyId(data.survey.id)
          }
        }
      })
      .catch(err => console.error('Error saving draft:', err))
  }

  const handleNextFromPage1 = () => {
    if (!formData.instructor_first_name || !formData.instructor_last_name) {
      alert('Please enter your first and last name')
      return
    }
    if (!formData.items_need_ordering) {
      alert('Please answer if items need to be ordered')
      return
    }
    
    saveDraft() // Ensure saved before moving on
    navigate('/instructor-inventory')
  }

  const handleSubmit = () => {
    console.log('Attempting to submit with surveyId:', surveyId)
    // if (!formData.instructor_first_name || !formData.instructor_last_name) {
    //   alert('Please enter your first and last name')
    //   return
    // }
    
    if (!surveyId) {
      alert('Survey not found. Please try again.')
      return
    }
    
    console.log('Submitting survey ID:', surveyId)
    
    fetch(`${API_URL}/api/surveys/${surveyId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubmitted(true)
        } else {
          alert('Failed to submit survey')
        }
      })
      .catch(err => {
        console.error('Error:', err)
        alert('Failed to submit survey')
      })
  }

  const handleBackToPage1 = () => {
    navigate('/instructor')
  }

  const handleLogout = () => {
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    navigate('/')
  }

  const updateForm = (field, value) => {
    setFormData({...formData, [field]: value})
  }

  if (loading) {
    return (
      <div className="survey-container">
        <div className="survey-content">
          <div className="survey-card">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="thankyou-container">
        <div className="thankyou-card">
          <div className="thankyou-icon">✓</div>
          <h1 className="thankyou-title">Thank You!</h1>
          <p className="thankyou-text">Your shift survey has been submitted successfully.</p>
          <p className="thankyou-subtext">Logging out in a moment...</p>
        </div>
      </div>
    )
  }

  if (currentPage === 1) {
    return (
      <div className="survey-container">
        <div className="survey-content">
          <div className="survey-header">
            <p>Logged in as: {userName}</p>
            <button onClick={handleLogout} className="logout-btn">Log out</button>
          </div>

          <div className="survey-card">
            <h1 className="survey-title">Storage Checklist</h1>
            <p className="survey-page-info">Page 1 of 3 </p>
            
            <div className="survey-sections">
              
              <div className="survey-section">
                <div className="input-group">
                  <label>Name <span className="required">*</span></label>
                  <div className="name-grid">
                    <div>
                      <input type="text" placeholder="First Name" value={formData.instructor_first_name}
                        onChange={(e) => updateForm('instructor_first_name', e.target.value)} className="text-input" />
                      <p className="input-hint">First Name</p>
                    </div>
                    <div>
                      <input type="text" placeholder="Last Name" value={formData.instructor_last_name}
                        onChange={(e) => updateForm('instructor_last_name', e.target.value)} className="text-input" />
                      <p className="input-hint">Last Name</p>
                    </div>
                  </div>
                </div>
                
                <div className="input-group">
                  <label>Date</label>
                  <input type="date" value={formData.date} onChange={(e) => updateForm('date', e.target.value)} className="date-input" />
                </div>
              </div>

              <div className="survey-section">
                <h2 className="section-title">Arrival Tasks <span className="required">*</span></h2>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.reviewed_task_list} onChange={(e) => updateForm('reviewed_task_list', e.target.checked)} className="checkbox-input" />
                    <span>I reviewed today's task list (Google Doc).</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.checked_in} onChange={(e) => updateForm('checked_in', e.target.checked)} className="checkbox-input" />
                    <span>I checked in with Iliana or Byron (if needed).</span>
                  </label>
                </div>
              </div>

              <div className="survey-section">
                <h2 className="section-title">Packing Materials <span className="required">*</span></h2>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.used_correct_materials} onChange={(e) => updateForm('used_correct_materials', e.target.checked)} className="checkbox-input" />
                    <span>Used the correct curriculum materials list</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.gathered_materials} onChange={(e) => updateForm('gathered_materials', e.target.checked)} className="checkbox-input" />
                    <span>Gathered all required materials</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.double_checked} onChange={(e) => updateForm('double_checked', e.target.checked)} className="checkbox-input" />
                    <span>Double-checked packed materials for completeness</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.labeled_bins} onChange={(e) => updateForm('labeled_bins', e.target.checked)} className="checkbox-input" />
                    <span>Labeled all bins/boxes with: "STEMNETICS" label, Site name, List of materials taped on the outside.</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.returned_bins} onChange={(e) => updateForm('returned_bins', e.target.checked)} className="checkbox-input" />
                    <span>Returned bins neatly to their shelf or area.</span>
                  </label>
                </div>
                
                <div style={{marginTop: '1rem'}}>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem'}}>Add any quick notes or packing issues (optional)</label>
                  <textarea value={formData.packing_notes} onChange={(e) => updateForm('packing_notes', e.target.value)} className="textarea-input" rows="3" placeholder="Any issues or notes..." />
                </div>
              </div>

              <div className="survey-section">
                <h2 className="section-title">Organization & Inventory <span className="required">*</span></h2>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.returned_all_items} onChange={(e) => updateForm('returned_all_items', e.target.checked)} className="checkbox-input" />
                    <span>Returned all items to their labeled spots.</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.shelves_clean} onChange={(e) => updateForm('shelves_clean', e.target.checked)} className="checkbox-input" />
                    <span>Shelves, walkways, and bins are clean and organized.</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.checked_low_stock} onChange={(e) => updateForm('checked_low_stock', e.target.checked)} className="checkbox-input" />
                    <span>Checked for low stock (half full or 5 kits or fewer).</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.logged_whiteboard} onChange={(e) => updateForm('logged_whiteboard', e.target.checked)} className="checkbox-input" />
                    <span>Logged low items on whiteboard</span>
                  </label>
                </div>
              </div>

              <div className="survey-section">
                <h2 className="section-title">Are we running low on any items? <span className="required">*</span></h2>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="radio" name="items_need_ordering" value="Yes" checked={formData.items_need_ordering === 'Yes'} onChange={(e) => updateForm('items_need_ordering', e.target.value)} className="radio-input" />
                    <span>Yes</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="radio" name="items_need_ordering" value="No" checked={formData.items_need_ordering === 'No'} onChange={(e) => updateForm('items_need_ordering', e.target.value)} className="radio-input" />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div style={{paddingTop: '1rem'}}>
                <button onClick={handleNextFromPage1} className="btn-primary">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentPage === 3) {
    return (
      <div className="survey-container">
        <div className="survey-content">
          <div className="survey-header">
            <p>Logged in as: {userName}</p>
          </div>

          <div className="survey-card">
            <h1 className="survey-title">Storage Checklist</h1>
            <p className="survey-page-info">Page 3 of 3 </p>
            
            <div className="survey-sections">
              
              <div className="survey-section">
                <h2 className="section-title">Site Drop Off Reminders</h2>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.materials_correct_classroom} onChange={(e) => updateForm('materials_correct_classroom', e.target.checked)} className="checkbox-input" />
                    <span>Make sure materials get dropped off in correct classroom</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.took_picture} onChange={(e) => updateForm('took_picture', e.target.checked)} className="checkbox-input" />
                    <span>Take a picture of dropped off materials and classroom info, send directly to the site group chat</span>
                  </label>
                </div>
              </div>

              <div className="survey-section">
                <h2 className="section-title">End of Shift Tasks <span className="required">*</span></h2>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.swept_floor} onChange={(e) => updateForm('swept_floor', e.target.checked)} className="checkbox-input" />
                    <span>Swept the floor</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.removed_trash} onChange={(e) => updateForm('removed_trash', e.target.checked)} className="checkbox-input" />
                    <span>Remove full trash bin from storage unit & place in dumpster.</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.locked_storage} onChange={(e) => updateForm('locked_storage', e.target.checked)} className="checkbox-input" />
                    <span>Locked storage unit securely.</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.checked_in_before_leaving} onChange={(e) => updateForm('checked_in_before_leaving', e.target.checked)} className="checkbox-input" />
                    <span>Checked in with Iliana or Byron before leaving.</span>
                  </label>
                </div>
              </div>

              <div className="survey-section">
                <h2 className="section-title">Shift Notes (optional)</h2>
                <textarea value={formData.shift_notes} onChange={(e) => updateForm('shift_notes', e.target.value)} className="textarea-input" rows="4" placeholder="Any additional notes about your shift..." />
              </div>

              <div style={{paddingTop: '1rem'}}>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <button onClick={handleBackToPage1} style={{flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '1rem', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: '600', border: 'none', cursor: 'pointer'}}>
                    Back to Page 1
                  </button>
                  <button onClick={handleSubmit} className="btn-submit" style={{flex: 2}}>Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default ShiftSurvey
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  
  // New States for Profile Picture
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);

  const token = localStorage.getItem('token');

  // Decode token to get User ID safely
  let userId = null;
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.id) { userId = decoded.id; }
      else if (decoded._id) { userId = decoded._id; }
      else if (decoded.userId) { userId = decoded.userId; }
    } catch (e) {
      console.error("Token error", e);
    }
  }

  useEffect(() => {
    if (!token) { 
      navigate('/login'); 
      return; 
    }

    const fetchMyData = async () => {
      try {
        const res = await axios.get("https://talexajobs.onrender.com/api/users/" + userId, {
          headers: { Authorization: "Bearer " + token }
        });
        
        if (res.data.success) {
          setFormData({
            fullName: res.data.user.fullName,
            email: res.data.user.email
          });
          
          // Set current profile picture if they have one
          if (res.data.user.profilePictureUrl) {
            let pUrl = res.data.user.profilePictureUrl;
            if (!pUrl.startsWith("http")) {
              const cleanPath = pUrl.split('\\').join('/');
              pUrl = "https://talexajobs.onrender.com/" + cleanPath;
            }
            setPreviewPic(pUrl);
          }
        }
      } catch (error) {
        toast.error("Could not load profile data.");
      }
    };
    if (userId) { fetchMyData(); }
  }, [token, userId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(function(prev) {
      return { ...prev, [name]: value };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = new FormData();
      updateData.append('fullName', formData.fullName);
      updateData.append('email', formData.email);
      
      if (selectedFile) {
        updateData.append('profilePicture', selectedFile);
      }

      const res = await axios.put('https://talexajobs.onrender.com/api/users/profile', updateData, {
        headers: { 
          token: token, 
          Authorization: "Bearer " + token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success("Account settings updated successfully!");
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Refresh the page so the Navbar grabs the new picture right away
        setTimeout(function() {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      let msg = "Failed to update settings.";
      if (error.response) {
        if (error.response.data) {
           if (error.response.data.message) { msg = error.response.data.message; }
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Account Settings</h1>
        <p className="text-slate-500 mb-8">Update your core identity credentials here.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PROFILE PICTURE UPLOAD AREA */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <div className="h-24 w-24 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
              {previewPic ? (
                <img src={previewPic} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl text-slate-400 font-bold">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Picture</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer" 
              />
              <p className="text-xs text-slate-400 mt-2">Recommended: Square image, max 2MB.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName} 
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={"px-6 py-3 rounded-xl font-bold text-white transition shadow-sm " + (loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")}
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
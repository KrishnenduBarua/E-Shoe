import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import useAuthStore from "../store/authStore";
import { api } from "../utils/api";

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.auth.getProfile();
        const profileData = response.data.data;
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          address: profileData.address || "",
          city: profileData.city || "",
          state: profileData.state || "",
          zipCode: profileData.zip_code || "",
        });
        // Update user in auth store
        setUser({
          ...user,
          name: profileData.name,
          email: profileData.email,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.auth.updateProfile(formData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      // Update user in auth store
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile - Flick</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.name}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                <nav className="space-y-2">
                  <button className="w-full text-left px-4 py-2 bg-gray-100 text-black rounded-lg font-medium">
                    Profile Information
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg">
                    My Orders
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg">
                    Address Book
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg">
                    Payment Methods
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg">
                    Wishlist
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Profile Information
                </h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name || ""}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue={user?.phoneNumber || ""}
                      className="input-field"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Phone number cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      className="input-field"
                      placeholder="Add your email address"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add email for order notifications
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                    <button type="button" className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Address Book
                </h2>
                <p className="text-gray-600 mb-4">
                  Manage your shipping addresses
                </p>
                <button className="btn-outline">+ Add New Address</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

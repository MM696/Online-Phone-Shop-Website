import React, { useState } from 'react';
import './App.css';
import SignUp from './components/signup';
import Login from './components/login';

import image1 from './assets/images/image1.jpg';
import image2 from './assets/images/image2.jpg';
import image3 from './assets/images/image3.jpg';

const phoneData = [
  {
    id: 1,
    name: "iPhone 16",
    price: 999,
    image: image1,
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    price: 899,
    image: image2,
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  },
  {
    id: 3,
    name: "Google Pixel 9 Pro XL",
    price: 799,
    image: image3,
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  },
];

function App() {
  const [cart, setCart] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [user, setUser] = useState(null);
  const [checkoutData, setCheckoutData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    deliveryType: 'delivery',
  });

  const addToCart = (phone) => {
    const existingItem = cart.find(item => item.id === phone.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === phone.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...phone, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decreaseQuantity = (id) => {
    setCart(cart.map(item =>
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://online-phone-shop-website.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...checkoutData,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total: getTotal(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Order placed successfully!');
        setCart([]);
        setShowCheckout(false);
        setCheckoutData({
          fullName: '',
          email: '',
          phoneNumber: '',
          address: '',
          deliveryType: 'delivery',
        });
      } else {
        alert(data.message || 'Something went wrong during checkout.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  const getTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="flex flex-wrap items-center justify-between bg-gray-900 text-white p-5 sticky top-0 z-[1000]">
        <div className="text-xl font-bold">PhoneXpress</div>
        <ul className="flex gap-5 ml-5 mt-2">
          <li>Home</li>
          <li>Wishlist</li>
          <li>Brand</li>
          <li>Contact Us</li>
        </ul>
        <div className="flex flex-1 justify-center w-full mt-2 md:mt-0">
          <input type="text" placeholder="Search phones..." className="px-3 py-2 rounded-full border-none w-4/5 max-w-md text-base" />
        </div>
        <ul className="flex gap-4 ml-auto mt-2 cursor-pointer flex-wrap">
          {user ? (
            <li onClick={handleLogout}>Account (Log Out)</li>
          ) : (
            <>
              <li onClick={() => setShowSignUp(true)}>Sign Up</li>
              <li onClick={() => setShowLogin(true)}>Log In</li>
            </>
          )}
        </ul>
      </nav>

      <div className="p-5">
        <h1 className="text-2xl font-bold mb-5">📱 Available Phones</h1>
        <div className="flex flex-col md:flex-row gap-10">
          {/* Phone List */}
          <div className="flex-1 flex flex-col gap-5">
            {phoneData.map((phone) => (
              <div key={phone.id} className="flex flex-col md:flex-row gap-5 bg-gray-100 p-4 rounded-lg items-start md:items-center">
                <img src={phone.image} alt={phone.name} className="w-[150px] h-auto rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold">{phone.name}</h3>
                  <p>{phone.description}</p>
                  <strong>₦{phone.price}</strong>
                  <button onClick={() => addToCart(phone)} className="bg-blue-600 text-white px-4 py-2 rounded ml-5 hover:bg-blue-800 mt-4">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart */}
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-3">🛒 Your Cart</h2>
            {cart.length === 0 ? (
              <p>No items in cart.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow mb-4">
                  <img src={item.image} alt={item.name} className="w-[150px] h-auto rounded-lg object-cover mb-2" />
                  <div className="font-semibold">{item.name}</div>
                  <div>Unit: ₦{item.price}</div>
                  <div className="flex items-center gap-3 my-2">
                    <button onClick={() => decreaseQuantity(item.id)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800">+</button>
                  </div>
                  <div>Total: ₦{item.price * item.quantity}</div>
                  <button onClick={() => removeFromCart(item.id)} className="bg-red-600 text-white px-3 py-1 mt-2 rounded hover:bg-red-800">Remove</button>
                </div>
              ))
            )}
            {cart.length > 0 && (
              <>
                <div className="text-lg font-bold my-2">Grand Total: ₦{getTotal()}</div>
                <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-800" onClick={() => setShowCheckout(true)}>
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000]">
          <div className="bg-white p-5 rounded-lg w-[90%] max-w-xl relative shadow-lg h-[90%]">
            <button className="absolute top-2 right-3 text-2xl" onClick={() => setShowLogin(false)}>×</button>
            <Login onClose={() => setShowLogin(false)} setUser={setUser} />
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000]">
          <div className="bg-white p-5 rounded-lg w-[90%] max-w-xl relative shadow-lg h-[90%]">
            <button className="absolute top-2 right-3 text-2xl" onClick={() => setShowSignUp(false)}>×</button>
            <SignUp onClose={() => setShowSignUp(false)} />
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000]">
          <div className="bg-white p-5 rounded-lg w-[90%] max-w-xl relative shadow-lg overflow-y-auto h-[90%]">
            <button className="absolute top-2 right-3 text-2xl" onClick={() => setShowCheckout(false)}>×</button>
            <h2 className="text-lg font-bold mb-3">Checkout</h2>
            <form className="bg-gray-100 p-4 mt-4 rounded-lg shadow" onSubmit={handleCheckoutSubmit}>
              <label>Full Name</label>
              <input className="block w-[95%] p-2 my-2 rounded border border-gray-300" type="text" name="fullName" value={checkoutData.fullName} onChange={handleCheckoutChange} required />

              <label>Email</label>
              <input className="block w-[95%] p-2 my-2 rounded border border-gray-300" type="email" name="email" value={checkoutData.email} onChange={handleCheckoutChange} required />

              <label>Phone Number</label>
              <input className="block w-[95%] p-2 my-2 rounded border border-gray-300" type="tel" name="phoneNumber" value={checkoutData.phoneNumber} onChange={handleCheckoutChange} required />

              <label>Address</label>
              <input className="block w-[95%] p-2 my-2 rounded border border-gray-300" type="text" name="address" value={checkoutData.address} onChange={handleCheckoutChange} required />

              <div className="flex gap-5 mt-3">
                <label className="flex items-center">
                  <input type="radio" name="deliveryType" value="delivery" checked={checkoutData.deliveryType === 'delivery'} onChange={handleCheckoutChange} />
                  <span className="ml-2">Delivery</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="deliveryType" value="pickup" checked={checkoutData.deliveryType === 'pickup'} onChange={handleCheckoutChange} />
                  <span className="ml-2">Pickup</span>
                </label>
              </div>

              <button type="submit" className="bg-green-600 text-white mt-4 py-2 px-4 rounded hover:bg-green-800">Submit Order</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

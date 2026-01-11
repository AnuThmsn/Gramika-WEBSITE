import React, { useState, useEffect } from 'react';
import CategoryButton from '../components/CategoryButton';
import ProductCard from '../components/ProductCard';
import Cart from './cart.jsx';
import { FaCarrot, FaAppleAlt, FaHome } from 'react-icons/fa';
import { GiMeatCleaver, GiMilkCarton, GiManualMeatGrinder } from "react-icons/gi";
import { CiSearch } from "react-icons/ci";

function BuyPage() {
  // require login to access Buy page
  React.useEffect(() => {
    const token = localStorage.getItem('gramika_token');
    if (!token) {
      // redirect to login
      window.location.href = '/login';
    }
  }, []);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (mounted) setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };
    fetchProducts();
    const onOrder = () => { fetchProducts(); };
    window.addEventListener('orderUpdated', onOrder);
    return () => {
      mounted = false;
      window.removeEventListener('orderUpdated', onOrder);
    };
  }, []);

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('gramika_token');
      const prodId = product._id || product.id || product.id;
      const qty = product.quantity || 1;

      // verify latest product availability before adding
      try {
        const check = await fetch(`/api/products/${prodId}`);
        if (check.ok) {
          const p = await check.json();
          if (p.quantity !== undefined && p.quantity <= 0) {
            alert('Sorry — this product is sold out and cannot be added to the cart.');
            return;
          }
        }
      } catch (e) {
        // ignore transient availability check errors, server will validate too
      }
      if (token) {
        // persist to backend
        const res = await fetch('/api/carts/item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product: prodId, qty, priceAt: product.price })
        });
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          const text = json?.msg || json?.message || await res.text().catch(() => null) || 'Failed to add to cart';
          console.error('BuyPage: add to cart failed', res.status, text);
          alert(text);
          return;
        } else {
          const body = await res.json().catch(() => null);
          console.log('BuyPage: add to cart response', body);
        }
        // notify cart component to reload
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        // guest: save to localStorage
        const saved = JSON.parse(localStorage.getItem('gramika_cart') || '[]');
        // ensure not already saved and product has stock
        const exists = saved.find(s => (s.id || s.product || s._id) === prodId);
        if (exists) {
          alert('Product already in cart');
        } else {
          saved.push({ id: prodId, name: product.name, price: product.price, quantity: qty, image: product.image || product.imageUrl || '' });
          localStorage.setItem('gramika_cart', JSON.stringify(saved));
          console.log('BuyPage: guest cart saved', saved);
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { source: 'BuyPage', guest: true } }));
        }
      }
      console.log(`BuyPage: ${qty} × ${product.name} added to cart.`);
    } catch (err) {
      console.error('Add to cart failed', err);
      alert('Could not add to cart');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Poultry & Meat":
        return <GiMeatCleaver />;
      case "Vegetables":
        return <FaCarrot />;
      case "Fruits":
        return <FaAppleAlt />;
      case "Dairy & Beverages":
        return <GiMilkCarton />;
      case "Bakery & Snacks":
        return <GiManualMeatGrinder />;
      case "Homemade Essentials":
        return <FaHome />;
      default:
        return null;
    }
  };

  // Update categoryButtonStyle to match header
  const categoryButtonStyle = {
    backgroundColor: '#1a3c22ff', // dark green
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '24px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: '"Lato", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(26, 60, 52, 0.08)'
  };

  const handleCartClick = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);
  const handleProceedToPayment = (amount) => {
    alert(`Proceeding to payment of ₹${amount}`);
    setIsCartOpen(false);
  };

  return (
    <div>
      {/* <Header onCartClick={handleCartClick} cartItemCount={cartItems.length} />
      <Cart
        isOpen={isCartOpen}
        onClose={handleCartClose}
        onProceedToPayment={handleProceedToPayment}
      /> */}

      <div style={{ padding: '32px 0', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Search and Sort section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '32px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80%',
            maxWidth: '800px',
            gap: '0px',
            background: '#f7f7f7', // very light grey background
            borderRadius: '32px',   // large curve for pill shape
            padding: '0 0 0 0',
            boxShadow: '0 2px 8px rgba(26, 60, 52, 0.04)'
          }}>
            {/* Search Input */}
            <div style={{
              position: 'relative',
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              background: 'transparent',
              borderRadius: '32px 0 0 32px',
              overflow: 'hidden'
            }}>
              <span style={{
                position: 'absolute',
                left: '22px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '22px',
                color: '#204229'
              }}>
                <CiSearch />
              </span>
              <input
                type="text"
                placeholder="Search Products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '18px 18px 18px 54px',
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '18px',
                  fontFamily: '"Lato", sans-serif',
                  background: 'transparent',
                  color: '#204229',
                  borderRadius: '32px 0 0 32px'
                }}
              />
            </div>
            {/* Custom Sort Dropdown */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              borderRadius: '0 32px 32px 0',
              padding: '0 32px',
              borderLeft: '1px solid #eee',
              height: '56px',
              cursor: 'pointer'
            }}>
              <div
                style={{
                  color: '#204229',
                  fontWeight: 'bold',
                  fontFamily: '"Lato", sans-serif',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                Sort
                <span style={{
                  fontSize: '18px',
                  color: '#204229'
                }}>▼</span>
              </div>
              {sortDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '60px',
                  right: '0',
                  background: '#fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                  zIndex: 10,
                  minWidth: '180px',
                  padding: '8px 0'
                }}>
                  <div
                    style={{
                      padding: '12px 24px',
                      cursor: 'pointer',
                      color: '#204229',
                      fontFamily: '"Lato", sans-serif',
                      fontSize: '16px',
                      fontWeight: sortOption === 'priceLowHigh' ? 'bold' : 'normal',
                      background: sortOption === 'priceLowHigh' ? '#f7f7f7' : 'transparent'
                    }}
                    onClick={() => { setSortOption('priceLowHigh'); setSortDropdownOpen(false); }}
                  >
                    Price: Low to High
                  </div>
                  <div
                    style={{
                      padding: '12px 24px',
                      cursor: 'pointer',
                      color: '#204229',
                      fontFamily: '"Lato", sans-serif',
                      fontSize: '16px',
                      fontWeight: sortOption === 'priceHighLow' ? 'bold' : 'normal',
                      background: sortOption === 'priceHighLow' ? '#f7f7f7' : 'transparent'
                    }}
                    onClick={() => { setSortOption('priceHighLow'); setSortDropdownOpen(false); }}
                  >
                    Price: High to Low
                  </div>
                  <div
                    style={{
                      padding: '12px 24px',
                      cursor: 'pointer',
                      color: '#204229',
                      fontFamily: '"Lato", sans-serif',
                      fontSize: '16px',
                      fontWeight: sortOption === 'nameAZ' ? 'bold' : 'normal',
                      background: sortOption === 'nameAZ' ? '#f7f7f7' : 'transparent'
                    }}
                    onClick={() => { setSortOption('nameAZ'); setSortDropdownOpen(false); }}
                  >
                    Name: A to Z
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '32px',
          justifyContent: 'center'
        }}>
          {["All", "Poultry & Meat", "Vegetables", "Fruits", "Dairy & Beverages", "Bakery & Snacks", "Homemade Essentials"].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                ...categoryButtonStyle,
                backgroundColor: selectedCategory === category ? '#63c959' : '#1a3c34',
                color: selectedCategory === category ? '#1a3c34' : '#fff',
                boxShadow: selectedCategory === category ? '0 4px 12px rgba(99, 201, 89, 0.15)' : '0 2px 8px rgba(26, 60, 52, 0.08)'
              }}
            >
              {getCategoryIcon(category)}
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          justifyContent: 'center'
        }}>
          {loadingProducts ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center' }}>Loading products…</div>
          ) : products
            .filter(item =>
              (selectedCategory === 'All' || item.category === selectedCategory) &&
              item.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
              if (sortOption === 'priceLowHigh') return a.price - b.price;
              if (sortOption === 'priceHighLow') return b.price - a.price;
              if (sortOption === 'nameAZ') return a.name.localeCompare(b.name);
              return 0;
            })
            .map((item, index) => {
              // decide image source: prefer imageUrl (S3/Cloudinary), then GridFS id, then legacy image
              const imageSrc = item.imageUrl || (item.imageGridFsId ? `/api/uploads/${item.imageGridFsId}` : item.image);
              return (
                <ProductCard
                  key={index}
                  image={imageSrc}
                  name={item.name}
                  price={item.price}
                  stock={item.quantity}
                  onAddToCart={(qty) => handleAddToCart({ ...item, quantity: qty })}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default BuyPage;

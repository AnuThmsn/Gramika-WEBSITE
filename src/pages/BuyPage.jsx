import React, { useState } from 'react';
import CategoryButton from '../components/CategoryButton';
import ProductCard from '../components/ProductCard';
import Cart from './cart.jsx';
import { FaCarrot, FaAppleAlt, FaHome } from 'react-icons/fa';
import { GiMeatCleaver, GiMilkCarton, GiManualMeatGrinder } from "react-icons/gi";
import { CiSearch } from "react-icons/ci";

function BuyPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const products = [
    { image: "egg.jpeg", name: "Egg", price: 10, category: "Poultry & Meat", quantity: 4 },
    { image: "milk.jpeg", name: "Milk", price: 20, category: "Dairy & Beverages", quantity: 4 },
    { image: "Homemade chocolates.webp", name: "Chocolates", price: 250, category: "Bakery & Snacks", quantity: 7 },
    { image: "chicken.jpeg", name: "Chicken", price: 250, category: "Poultry & Meat", quantity: 3 },
    { image: "buns.webp", name: "Bun", price: 30, category: "Bakery & Snacks", quantity: 5 },
    { image: "Butter Buns.jpg", name: "Butter Bun", price: 50, category: "Bakery & Snacks", quantity: 1 },
    { image: "Coconut oil.jpeg", name: "Coconut Oil", price: 250, category: "Homemade Essentials", quantity: 2 },
    { image: "cream cakes.jpg", name: "Cream Cake", price: 400, category: "Bakery & Snacks", quantity: 4 },
    { image: "jam.jpg", name: "Jam", price: 350, category: "Homemade Essentials", quantity: 4 },
    { image: "soap.jpeg", name: "Soap", price: 250, category: "Homemade Essentials", quantity: 4 },
    { image: "Cookies.jpeg", name: "Cookies", price: 250, category: "Bakery & Snacks", quantity: 4 },
    { image: "coconut.jpeg", name: "Coconut", price: 250, category: "Homemade Essentials", quantity: 4 },
    { image: "brinjal.jpeg", name: "Brinjal", price: 250, category: "Vegetables", quantity: 4 },
    { image: "chilli.jpeg", name: "Chilli", price: 150, category: "Vegetables", quantity: 4 },
    { image: "ladys finger.jpeg", name: "Lady's Finger", price: 200, category: "Vegetables", quantity: 4 },
    { image: "tomato.jpeg", name: "Tomato", price: 500, category: "Vegetables", quantity: 4 },
    { image: "pea.jpeg", name: "Pea", price: 250, category: "Vegetables", quantity: 4 },
    { image: "mango.webp", name: "Mango", price: 800, category: "Fruits", quantity: 4 },
    { image: "guava.jpeg", name: "Guava", price: 650, category: "Fruits", quantity: 4 },
    { image: "dragon fruit.jpeg", name: "Dragon Fruit", price: 250, category: "Fruits", quantity: 4 }
  ];

  const handleAddToCart = (product) => {
    setCartItems([...cartItems, product]);
    console.log(`${product.quantity} × ${product.name} added to cart!`); // Replaced alert()
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
          {products
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
            .map((item, index) => (
              <ProductCard
                key={index}
                image={item.image}
                name={item.name}
                price={item.price}
                stock={item.quantity}
                onAddToCart={(qty) => handleAddToCart({ ...item, quantity: qty })}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default BuyPage;

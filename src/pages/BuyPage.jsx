import React, { useState } from 'react';
import CategoryButton from '../components/CategoryButton';
import ProductCard from '../components/ProductCard';

function BuyPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);

  const products = [
    { image: "egg.jpeg", name: "Egg", price: 10, category: "Poultry & Meat" , quantity: 4},
    { image: "milk.jpeg", name: "Milk", price: 20, category: "Dairy & Beverages",quantity: 4 },
    { image: "Homemade chocolates.webp", name: "Chocolates", price: 250, category: "Bakery & Snacks", quantity:7 },
    { image: "chicken.jpeg", name: "Chicken", price: 250, category: "Poultry & Meat" , quantity:3},
    { image: "buns.webp", name: "Bun", price: 30, category: "Bakery & Snacks", quantity:5 },
    { image: "Butter Buns.jpg", name: "Butter Bun", price: 50, category: "Bakery & Snacks" , quantity:1},
    { image: "Coconut oil.jpeg", name: "Coconut Oil", price: 250, category: "Homemade Essentials", quantity:2 },
    { image: "cream cakes.jpg", name: "Cream Cake", price: 400, category: "Bakery & Snacks", quantity:4 },
    { image: "jam.jpg", name: "Jam", price: 350, category: "Homemade Essentials", quantity:4 },
    { image: "soap.jpeg", name: "Soap", price: 250, category: "Homemade Essentials" , quantity:4},
    { image: "Cookies.jpeg", name: "Cookies", price: 250, category: "Bakery & Snacks", quantity:4 },
    { image: "coconut.jpeg", name: "Coconut", price: 250, category: "Homemade Essentials", quantity:4 },
    { image: "brinjal.jpeg", name: "Brinjal", price: 250, category: "Vegetables", quantity:4 },
    { image: "chilli.jpeg", name: "Chilli", price: 150, category: "Vegetables", quantity:4 },
    { image: "ladys finger.jpeg", name: "Lady's Finger", price: 200, category: "Vegetables", quantity:4 },
    { image: "tomato.jpeg", name: "Tomato", price: 500, category: "Vegetables", quantity:4 },
    { image: "pea.jpeg", name: "Pea", price: 250, category: "Vegetables", quantity:4 },
    { image: "mango.webp", name: "Mango", price: 800, category: "Fruits", quantity:4 },
    { image: "guava.jpeg", name: "Guava", price: 650, category: "Fruits" , quantity:4},
    { image: "dragon fruit.jpeg", name: "Dragon Fruit", price: 250, category: "Fruits", quantity:4 }
  ];

 const handleAddToCart = (product) => {
  setCartItems([...cartItems, product]);
  alert(`${product.quantity} × ${product.name} added to cart!`);
};


  return (
    <div style={{
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ textAlign: 'right', marginBottom: '10px', color: 'white' }}>
        🛒 Items in Cart: {cartItems.length}
      </div>

      <h1 style={{
        color: '#ffffff',
        marginBottom: '20px',
        textAlign: 'center',
        fontFamily: 'Segoe UI'
      }}>
      </h1>

      {/* Sort Dropdown */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ color: '#fff', marginRight: '10px' }}>Sort by:</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: '5px', borderRadius: '5px' }}
        >
          <option value="">-- Select --</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
          <option value="nameAZ">Name: A to Z</option>
        </select>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '60%', margin: '0 auto' }}>
          <span style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: '#888'
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 10px 10px 35px',
              width: '100%',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center'
      }}>
        {["All", "Poultry & Meat", "Vegetables", "Fruits", "Dairy & Beverages", "Bakery & Snacks", "Homemade Essentials"].map(category => (
          <CategoryButton
            key={category}
            label={category}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
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
  );
}

export default BuyPage;

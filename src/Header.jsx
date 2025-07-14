import { HiUserCircle } from "react-icons/hi";

function Header(){
    return(
        <div className='navbar'>
            <div>
                <img className="logo" src="src/assets/gramika.png"/>
            </div>
            <div className="nav-links">
               <span>buy</span>
                <span>cart</span>
                <span>sell</span>
                <span>orders</span>
            </div>
            <div className="profile">
                <HiUserCircle size={45} color="#FFDB58" />
            </div>
        </div>
    )
}

export default Header;
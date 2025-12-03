import { Link } from 'react-router-dom';


//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/Rewards.css'
import '../styles/App.css'
import Layout from "../components/layout";


{/**
    Places to connect to backend: 
    1) getCoins -- for piggy bank box
    2) when you cadd an incentive should be tracked on backend? 
    3) 
    */}

export default function Rewards() {
    return(
        <div className='rewardsContainer'>


            <div className='topRow'>

                {/* Piggy Bank Box */}
                <div className="card squareCard">
                    <h2> Piggy Bank</h2>
                    <p> You have <span className="circleBackground">13</span> coins! </p>
                </div>

                {/* Parent Incentives Box */}
                {/* need to connect parent card to backened getIncentives call? --  */}
                <div className="card rectangleCard">
                    <h2> Parent Incentives</h2>

                    <div className='customIncentiveBox'>
                        <p> Incentive: </p> {/* to print call from backend here?? */}

                    </div>

                    <div className='customIncentiveBox'>
                        <p> Incentive: </p> {/* to print call from backend here?? */}
                        
                    </div>

                    <div className='customIncentiveBox'>
                        <p> Incentive: </p> {/* to print call from backend here?? */}
                    </div>
                </div>
            </div>

             <div className='bottomRow'>

                {/* Store For Skins */}
                <div className="card rectangleCard">
                    <h2> Store: </h2>

                     <div className='changeSkinBox'>
                        <p> Dark app skin: 10 coins</p> 
                    </div>

                    <div className='changeSkinBox'>
                        <p> Neon app skin: 10 coins</p> 
                    </div>
                </div>
            
            
            </div>

        </div>
    );
}
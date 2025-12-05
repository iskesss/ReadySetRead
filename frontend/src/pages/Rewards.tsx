import { useState} from "react";

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/Rewards.css'
import '../styles/App.css'

export default function Rewards() {
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [pageBackground, setPageBackground] = useState<string>(""); // default background

  const changeSkin = (color: string) => {
    setSelectedColor(color);
    setPopUpOpen(true);
  };

  const yesClicked = () => {
    setPageBackground(selectedColor); // Apply the chosen skin
    setPopUpOpen(false);
  };

  const noClicked = () => {
    setPopUpOpen(false);
  };


  return (
    <div
      className="rewardsPage"
      style={{ background: pageBackground, minHeight: '100vh', transition: 'background 0.5s ease' }}
    >

      {popUpOpen && (
        <div className="popUpOverlay">
          <div className="popUpBox">
            <p>Are you sure you want to buy this app skin for 10 coins?</p>

            <div className="popUpButtons">
              <button onClick={yesClicked}>Yes</button>
              <button onClick={noClicked}>No</button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="topRow">
          <div className="card piggyCard">
            <h2>Piggy Bank</h2>
            <p>You have <span className="coinBubble">13</span> coins!</p>
          </div>

          <div className="card parentCard">
            <h2>Parent Incentives</h2>
            <Button className="miniReward">Ice cream: 25 coins</Button>
            <Button className="miniReward">New soccer ball: 30 coins</Button>
            <Button className="miniReward">New Xbox: 500 coins</Button>
          </div>
        </div>

        <div className="fullRow">
          <div className="card storeCard">
            <h2>Store</h2>

            <div className="storeItemsRow">
              <Button className="storeItem" onClick={() => changeSkin("linear-gradient(180deg, #567d46, #3b5e34, #283c22, #1e261d)")} > 
                Jurassic Jungle Skin: 10 coins
              </Button>

              <Button className="storeItem" onClick={() => changeSkin("linear-gradient(to bottom right, #3e0000, #800000, #ff4500)")}> 
                Dragon Fire Skin: 10 coins 
              </Button>

              <Button
                className="storeItem"
                onClick={() => changeSkin("linear-gradient(180deg, #FF9A9E, #FECFEF, #E0C3FC)")}
                /*style={{ backgroundColor: "linear-gradient(180deg, #FF9A9E, #FECFEF, #E0C3FC)" }}*/
              >
                Candy Kingdom Skin: 10 coins
              </Button>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/Rewards.css'
import '../styles/App.css'

export default function Rewards() {
  return (
    <div className="rewardsPage">

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
              <Button className="storeItem"> Dark app skin: 10 coins</Button>
              <Button className="storeItem"> Neon app skin: 10 coins </Button>
              <Button className="storeItem">  Jungle app skin: 20 coins </Button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
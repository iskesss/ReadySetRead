import { useEffect, useState } from "react";

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/Rewards.css'
import '../styles/App.css'

//Api imports
import { getNumCoins, listCustomRewards, redeemCustomReward } from "../api/rewards";
import { getCurrentStudent } from "../api/students";
import type { CustomReward, GetCoinsRequest, ListCustomRewardsRequest, RedeemCustomRewardRequest } from "../api/types";

export default function Rewards() {
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [pageBackground, setPageBackground] = useState<string>(""); // default background

  const [myId, setMyId] = useState<number>()
  const [numCoins, setNumCoins] = useState<number>()
  const [customRewards, setCustomRewards] = useState<CustomReward[]>([])
  const [rewardRedeemed] = useState<boolean[]>([false]);

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

  // ON PAGE LOAD: Get my Id
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCurrentStudent()
        setMyId(result.child_id)
      } catch (error) {
        console.error('Error getting quiz assignments: ', error)
      }
    }
    fetchData()
  }, [])

  //ON PAGE LOAD: Get num coins
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (myId) {
          const request: GetCoinsRequest = { child_id: myId };
          const result = await getNumCoins(request)
          setNumCoins(result.num_coins)
        }
      } catch (error) {
        console.error('Error getting coins: ', error)
      }
    }
    fetchData()
  }, [myId])

  //ON PAGE LOAD: Get Custom Rewards
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (myId) {
          const request: ListCustomRewardsRequest = { child_id: myId };
          const result = await listCustomRewards(request)
          setCustomRewards(result.custom_rewards)
        }
      } catch (error) {
        console.error('Error: getting custom rewards', error)
      }
    }
    fetchData()
  }, [myId])

  //ON PAGE LOAD: Get num coins
  useEffect(() => {
    const fetchData = async () => {
      try {
        return
      } catch (error) {
        console.error('Error: ', error)
      }
    }
    fetchData()
  }, [])


  //When redeem custom rewards is clicked
  async function redeemCustomRewardClicked(reward_id: number, reward_index: number) {
    try {
      if (myId && reward_id) {
        const request: RedeemCustomRewardRequest = { child_id: myId, reward_id: reward_id }
        const result = await redeemCustomReward(request)

        rewardRedeemed[reward_index] = true

        return result
      }
    } catch (error) {
      console.log('Error redeeming custom reward: ', error)
    }
  }


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
            <p>You have <span className="coinBubble">{numCoins ?? 0}</span> coins!</p>
          </div>

          <div className="card parentCard">
            <h2>Parent Incentives</h2>
            {customRewards.map((customReward, index) => {
              return (
                <Button
                  onClick={() => redeemCustomRewardClicked(customReward.reward_id, index)}
                  className="miniReward"
                  style={rewardRedeemed[index] ? { backgroundColor: 'green' } : {}}
                >
                  {customReward.description} : {customReward.coin_cost} coins
                </Button>
              )
            })}
            <Button className="miniReward">Ice cream: 25 coins</Button>
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
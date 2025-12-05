import { useEffect, useState } from "react";

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/Rewards.css'
import '../styles/App.css'

//Api imports
import { getBackgroundSkin, getNumCoins, listCustomRewards, redeemCustomReward, spendCoins, updateBackgroundSkin } from "../api/rewards";
import { getCurrentStudent } from "../api/students";
import type { CustomReward, GetCoinsRequest, ListCustomRewardsRequest, RedeemCustomRewardRequest, SpendCoinsRequest, UpdateBackgroundSkinRequest } from "../api/types";

export default function Rewards() {
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [pageBackground, setPageBackground] = useState<string>(""); // default background

  const [myId, setMyId] = useState<number>()
  const [numCoins, setNumCoins] = useState<number>()
  const [customRewards, setCustomRewards] = useState<CustomReward[]>([])
  const [rewardRedeemed, setRewardRedeemed] = useState<boolean[]>([]);

  const [selectedBackgroundPrice, setSelectedBackgroundPrice] = useState<number>()
  const [insufficientFunds, setInsufficientFunds] = useState(false)


  //Database for app skins here for now
  const appSkins = {
    jurassicJungle: {
      name: "Jurassic Jungle Skin",
      cost: 1,
      gradient: "linear-gradient(180deg, #567d46, #3b5e34, #283c22, #1e261d)"
    },
    dragonFire: {
      name: "Dragon Fire Skin",
      cost: 1,
      gradient: "linear-gradient(to bottom right, #3e0000, #800000, #ff4500)"
    },
    candyKingdom: {
      name: "Candy Kingdom Skin",
      cost: 1,
      gradient: "linear-gradient(180deg, #FF9A9E, #FECFEF, #E0C3FC)"
    }
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
          setCustomRewards(result)
          console.log("Got Custom rewards: ", result)
        }
      } catch (error) {
        console.error('Error: getting custom rewards', error)
      }
    }
    fetchData()
  }, [myId])

  //ON PAGE LOAD: get current background skin
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getBackgroundSkin()
        setPageBackground(result.bg_skin)
        return
      } catch (error) {
        console.error('Error: ', error)
      }
    }
    fetchData()
  }, [])

  //ON PAGE LOAD: template
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
  async function redeemCustomRewardClicked(reward_id: number, reward_index: number, cost: number) {
    try {
      if (myId && reward_id) {
        const request: RedeemCustomRewardRequest = { child_id: myId, reward_id: reward_id }
        const result = await redeemCustomReward(request) //Coins spent in this function

        // Update the rewardRedeemed array to re render for ui change
        setRewardRedeemed(prev => {
          const newRedeemed = [...prev];
          newRedeemed[reward_index] = true;
          return newRedeemed;
        });

        // Update coin count in ui
        if (result.success && result.remaining_coins !== undefined) {
          setNumCoins(result.remaining_coins);
        }

        return result
      }
    } catch (error) {
      console.log('Error redeeming custom reward: ', error, cost)
    }
  }

  async function yesClicked(price: number) {
    try {
      const spendRequest: SpendCoinsRequest = { coins_to_spend: price }
      const result = await spendCoins(spendRequest)
      if (result.success) {
        const backgroundRequest: UpdateBackgroundSkinRequest = { new_skin: selectedColor }
        const bgResult = await updateBackgroundSkin(backgroundRequest)
        console.log("success updating app skin: ", bgResult)
        setPageBackground(selectedColor); // apply the chosen skin

        // update coin count in UI
        if (result.remaining_coins !== undefined) {
          setNumCoins(result.remaining_coins);
        }

        setPopUpOpen(false);
      } else {
        setInsufficientFunds(true);
        setTimeout(() => {
          setInsufficientFunds(false);
          setPopUpOpen(false);
        }, 2000);
      }

    } catch (error) {
      console.log('Error updating app skin on backend: ', error)
      setPopUpOpen(false);
    }
  };

  const noClicked = () => {
    setPopUpOpen(false);
  };

  async function shopItemClicked(skinGradient: string, price: number) {
    changeSkin(skinGradient, price)
  }

  const changeSkin = (color: string, price: number) => {
    setSelectedColor(color);
    setSelectedBackgroundPrice(price)
    setPopUpOpen(true);
  };


  return (
    <div
      className="rewardsPage"
      style={{ background: pageBackground, minHeight: '100vh', transition: 'background 0.5s ease' }}
    >

      {popUpOpen && (
        <div className="popUpOverlay">
          <div className="popUpBox">
            {insufficientFunds ? (
              <p>Insufficient funds! You need more coins.</p>
            ) : (
              <>
                <p>Are you sure you want to buy this app skin?</p>
                <div className="popUpButtons">
                  <button onClick={() => yesClicked(selectedBackgroundPrice ?? 0)}>Yes</button>
                  <button onClick={noClicked}>No</button>
                </div>
              </>
            )}
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
            {customRewards?.map((option, index) => {
              return (
                <Button
                  onClick={() => redeemCustomRewardClicked(option.reward_id, index, option.coin_cost)}
                  className="miniReward"
                  style={rewardRedeemed[index] ? { backgroundColor: 'green' } : {}}
                >
                  {option.description} : {option.coin_cost} coins
                </Button>
              )
            })}
            {/* <Button className="miniReward">Ice cream: 25 coins</Button> */}
          </div>
        </div>

        <div className="fullRow">
          <div className="card storeCard">
            <h2>Store</h2>

            <div className="storeItemsRow">
              {Object.entries(appSkins).map(([key, skin]) => (
                <Button
                  key={key}
                  className="storeItem"
                  onClick={() => shopItemClicked(skin.gradient, skin.cost)}
                >
                  {skin.name}: {skin.cost} coins
                </Button>
              ))}

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
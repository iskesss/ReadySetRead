
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import logo from '../logo.png';

//Component imports
import { Button } from '../components/button';

//Style imports
import '../styles/ParentLanding.css'
import '../styles/App.css'

// API imports
import { getStudents, getMe } from '../api/parents'
import type { ChildOut } from '../api/types'


export default function ParentLandingPage() {
  const [students, setStudents] = useState<ChildOut[]>([])
  const [me, setMe] = useState<string>()

  // ON PAGE LOAD: get my name for greeting
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getMe()
        console.log("retrieved me successfully: ", result.adult_name)
        setMe(result.adult_email)
      } catch (error) {
        console.error('Error with me api call: ', error)
      }
    }
    fetchData()
  })


  // ON PAGE LOAD: get this parent's children
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getStudents()
        setStudents(result)
      } catch (error) {
        console.error('Error getting list of students: ', error)
      }
    }

    fetchData()
  }, [])

  return (
    //CONNECT TO BACKEND:CHILDREN NAME(S) & # cards displayed (edge case to add child?)
    //must also add links to each specific child's progress page

    <div className='parentLandingContainer'>

      <div className='header'>
        <Link to="/">
          <Button className="btn logoutBtn">
            Log out
          </Button>
        </Link>

        <h1> Welcome, {me}!</h1>
      </div>

      {students.map((option) => (
        <div className="card studentCard">
          <div className='childName'> {option.child_name} </div>
          <Link to="/ParentProgress">
            <Button className=' btn viewProgress'> View Progress </Button>
          </Link>
        </div>
      ))}

    </div>
  );
}
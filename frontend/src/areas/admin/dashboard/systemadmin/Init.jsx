import react from 'react'
export function Init() {
  const clickHandler = async (e) => {
    e.preventDefault()
    const res = await fetch('http://localhost:3000/api/list-databases')
    const data = await res.json()
    console.log(data)
  }
  return (
    <>
      <h1>this is hello from the init page</h1>
      <div>
        {/* <select name="" id=""></select> */}
        <button onClick={clickHandler}>click me :D</button>
      </div>
    </>
  )
}

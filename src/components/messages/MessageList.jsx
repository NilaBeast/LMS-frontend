export default function MessageList({ messages }){

return(

<div style={container}>

{messages.map(m=>(

<div key={m.id} style={message}>

<div style={user}>
User {m.User?.email}
</div>

<p>{m.message}</p>

</div>

))}

</div>

);

}

/* styles */

const container={
display:"flex",
flexDirection:"column",
gap:10
}

const message={
background:"#f5f7ff",
padding:10,
borderRadius:8
}

const user={
fontWeight:"bold",
fontSize:13
}
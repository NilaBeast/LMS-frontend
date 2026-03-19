export default function MemberRow({ member }){

return(

<div style={{
display:"flex",
justifyContent:"space-between",
padding:10,
borderBottom:"1px solid #eee"
}}>

<div>{member.User?.name}</div>

<div>{member.User?.email}</div>

<div>{member.role}</div>

</div>

);

}
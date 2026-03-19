export default function CommunitySidebar({ tab, setTab, isOwner }) {

  const item = (name,icon) => (

    <div
      onClick={() => setTab(name)}
      style={{
        ...itemStyle,
        ...(tab === name ? activeItem : {})
      }}
    >

      <span>{icon}</span>

      {name.charAt(0).toUpperCase() + name.slice(1)}

    </div>

  );

  return (

    <div style={sidebar}>

      <h3 style={title}>Navigation</h3>

      {item("feed","📰")}

      {isOwner && item("members","👥")}

      {item("messages","💬")}

    </div>

  );

}

/* styles */

const sidebar={
  background:"#fff",
  padding:20,
  borderRadius:12,
  border:"1px solid #eee",
  display:"flex",
  flexDirection:"column",
  gap:10,
  boxShadow:"0 6px 14px rgba(0,0,0,0.05)"
}

const title={
  fontSize:14,
  marginBottom:10,
  color:"#888"
}

const itemStyle={
  padding:"12px 14px",
  borderRadius:10,
  cursor:"pointer",
  display:"flex",
  gap:10,
  alignItems:"center",
  transition:"all .2s"
}

const activeItem={
  background:"#ffd54f",
  fontWeight:"bold"
}
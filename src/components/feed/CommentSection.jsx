import { likeCommunityPostApi } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

export default function PostActions({ post,reload }){

const { token } = useAuth();

const like = async()=>{

await likeCommunityPostApi(post.id,token);

reload();

};

return(

<div style={{display:"flex",gap:20}}>

<span
onClick={like}
style={{cursor:"pointer"}}
>
❤️ {post.likesCount || 0}
</span>

<span>
💬 {post.commentsCount || 0}
</span>

</div>

);

}
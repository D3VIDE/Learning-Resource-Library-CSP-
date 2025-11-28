import { success } from "zod";
import { supabase } from "./supabaseBrowser";

export async function signup(name:string, email:string, password:string) {
  const {data,error} = await supabase.auth.signUp({
    email,
    password,
    options:{
      data:{name},
    },
  });

  if(error){
     return { success: false, error: error.message };
  }else{
    return {success:true, user: data.user}
  }
}


export async function login(email:string, password:string){
  const {data,error} = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error){
    return {success:false,error:error.message}
  }else{
    return{success:true,user:data.user}
  }
}

export async function logout(){
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const {data} = await supabase.auth.getUser();
  return data.user;
}
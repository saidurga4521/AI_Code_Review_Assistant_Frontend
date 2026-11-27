import { useParams } from "react-router-dom";  

export default function RepoDetail(){
  const {repoId}=useParams() // used to extract the placeholder from page url
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Repository Details (ID: {repoId})</h1>
      <p className="text-sm text-slate-400">Codebase Q&A chat and PR review tabs will live here.</p>
    </div>
  );
}
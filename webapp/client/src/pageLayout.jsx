export default function PageLayout({title, body}) {
  return (
    <div className="p-10" style={{width:"75vw"}}>
        <h1>{title}</h1>
        <p>{body}</p>
    </div>
  )
}
export default function PageLayout({title, body}) {
  return (
    <div className="p-10" style={{width:"75vw"}}>
        <h1 className="py-6">{title}</h1>
        <p className="gradient-text s24">{body}</p>
    </div>
  )
}
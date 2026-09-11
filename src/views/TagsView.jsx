export default function TagsView({ tags }) {
  return (
    <section className="view-shell">
      <div className="view-head">
        <span>Tags</span>
        <h1>Soft structure across albums.</h1>
        <p>Tags help you find all images from a theme, person, client delivery, or inherited archive.</p>
      </div>
      <div className="tag-index">
        {tags.map(tag => (
          <button key={tag}>#{tag}</button>
        ))}
      </div>
    </section>
  );
}

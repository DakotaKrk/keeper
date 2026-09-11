export default function PeopleView({ people }) {
  return (
    <section className="view-shell">
      <div className="view-head">
        <span>People</span>
        <h1>Faces become a way back in.</h1>
        <p>People stays in the MVP because it helps memories feel human, not just organized.</p>
      </div>
      <div className="people-index">
        {people.map(person => (
          <button key={person} className="person-index-item">
            <span>{person[0]}</span>
            <strong>{person}</strong>
            <small>Connected memories</small>
          </button>
        ))}
      </div>
    </section>
  );
}

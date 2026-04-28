const cities = ['Taipei', 'Tokyo', 'Singapore', 'Los Angeles', 'London'];

export default function CityList() {
    return (
    <ul>
        {cities.map((city) => (
        <li key={city}>{city}</li>
        ))}
    </ul>
    );
}
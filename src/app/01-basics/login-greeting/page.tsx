export default function LoginGreeting() {
    const isLoggedIn = true

    return (
        <div>
            {isLoggedIn ? <p>Welcome Back!</p> : <p>Login First</p>}
        </div>
    )
}
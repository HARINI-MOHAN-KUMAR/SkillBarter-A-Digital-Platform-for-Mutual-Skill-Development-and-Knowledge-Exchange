import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'

export default function GoogleLoginButton({ label = 'Continue with Google' }) {
  const { googleLogin } = useAuth()
  const navigate = useNavigate()

  const handleSuccess = async (credentialResponse) => {
    try {
      const { user, is_new } = await googleLogin(credentialResponse.credential)
      toast.success(`Welcome${is_new ? '' : ' back'}, ${user.name}! 🎉`)
      navigate(is_new || !user.onboarding_complete ? '/onboarding' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google login failed')
    }
  }

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error('Google login failed. Check your Client ID in backend/.env')}
        text={label === 'Sign up with Google' ? 'signup_with' : 'signin_with'}
        shape="rectangular"
        theme="outline"
        size="large"
        width="360"
      />
    </div>
  )
}

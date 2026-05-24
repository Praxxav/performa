import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Set the API URL based on the environment
const API_URL =
    import.meta.env.MODE === "development" ?
        "http://localhost:3000/upgrade" :
        "https://proforma-sohi.vercel.app/upgrade";

axios.defaults.withCredentials = true;

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const transactionId = searchParams.get('transaction_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!transactionId) return navigate('/upgrade-error');

            try {
                const res = await axios.post(
                    `${API_URL}/verify-payment`,
                    { transactionId }
                );
                if (res.data.status === 'success') {
                    navigate('/upgrade-success');
                } else {
                    navigate('/upgrade-error');
                }
            } catch (err) {
                console.error(err);
                navigate('/upgrade-error');
            }
        };

        verifyPayment();
    }, [transactionId]);

    return <p className='font-satoshi flex justify-center items-center h-screen'>Verifying payment...</p>;
};

export default PaymentStatus;

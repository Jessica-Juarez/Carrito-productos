import Registro from '../components/registro';

export default function RegistroPage() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      margin: 0,
    }}>
      <Registro />
    </div>
  );
}
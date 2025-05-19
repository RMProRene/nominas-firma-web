import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sdkgzrmowipezgjrqouo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka2d6cm1vd2lwZXpnanJxb3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU3OTA0MCwiZXhwIjoyMDYzMTU1MDQwfQ.BkNd9dCxsCink1B5bPpjKzJNBYCk_4h61iTQc227xMo";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [user, setUser] = useState(null);
  const [nominaUrl, setNominaUrl] = useState(null);
  const [motivo, setMotivo] = useState("");
  const sigCanvas = useRef({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      // Simulación: aquí debes buscar la nómina correspondiente al usuario
      setNominaUrl("/ejemplo_nomina.pdf");
    });
  }, []);

  const handleFirmar = async () => {
    const firmaData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    alert("Firma capturada. Aquí la subirías a Supabase Storage y guardarías en la tabla 'firmas'.");
  };

  const handleRechazar = () => {
    alert("Motivo de rechazo: " + motivo);
    // Aquí enviarías ese motivo a la base de datos en la tabla 'nominas'
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido</h1>
      {nominaUrl && (
        <>
          <h2>Tu nómina:</h2>
          <iframe src={nominaUrl} width="100%" height="500px" />
        </>
      )}
      <h3>Firma aquí:</h3>
      <SignatureCanvas
        penColor="black"
        canvasProps={{ width: 300, height: 150, className: "sigCanvas" }}
        ref={sigCanvas}
      />
      <button onClick={handleFirmar}>Firmar</button>
      <hr />
      <h3>¿No estás de acuerdo?</h3>
      <textarea placeholder="Escribe el motivo" value={motivo} onChange={e => setMotivo(e.target.value)} />
      <button onClick={handleRechazar}>Rechazar</button>
    </div>
  );
}

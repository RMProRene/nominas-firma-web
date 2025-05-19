import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sdkgzrmowipezgjrqouo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka2d6cm1vd2lwZXpnanJxb3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU3OTA0MCwiZXhwIjoyMDYzMTU1MDQwfQ.BkNd9dCxsCink1B5bPpjKzJNBYCk_4h61iTQc227xMo";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [user, setUser] = useState({ email: "juan@ejemplo.com" }); // simular login
  const [nominaUrl, setNominaUrl] = useState(null);
  const [motivo, setMotivo] = useState("");
  const sigCanvas = useRef({});

  useEffect(() => {
    const fetchNomina = async () => {
      // Buscar el empleado por email
      const { data: empleados, error: empError } = await supabase
        .from("empleados")
        .select("id")
        .eq("email", user.email)
        .single();

      if (empError || !empleados) {
        console.error("Empleado no encontrado");
        return;
      }

      const empleadoId = empleados.id;

      // Buscar la nómina asignada
      const { data: nominas, error: nomError } = await supabase
        .from("nominas")
        .select("archivo_url")
        .eq("empleado_id", empleadoId)
        .eq("estado", "pendiente")
        .order("fecha_subida", { ascending: false })
        .limit(1)
        .single();

      if (nominas) {
        setNominaUrl(nominas.archivo_url);
      } else {
        console.warn("No hay nóminas pendientes");
      }
    };

    fetchNomina();
  }, [user]);

  const handleFirmar = async () => {
  const firmaBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");

  if (!nominaUrl) {
    alert("No hay nómina cargada.");
    return;
  }

  try {
    const response = await fetch("/api/firmar-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdfUrl: nominaUrl,
        firmaBase64: firmaBase64,
        empleadoId: "54f01dc2-2bcf-4afb-8e32-2f218fd289fc",
        nominaId: "07cf0010-0a7a-4304-ab4d-9ae858e95ad2"
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ Nómina firmada correctamente");
      window.location.reload();
    } else {
      alert("❌ Error al firmar: " + data.error);
    }
  } catch (err) {
    console.error("ERROR AL ENVIAR A LA API", err);
    alert("❌ Error inesperado");
  }
};

  const handleRechazar = () => {
    alert("Motivo de rechazo: " + motivo);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido, {user.email}</h1>
      {nominaUrl ? (
        <>
          <h2>Tu nómina:</h2>
          <iframe src={nominaUrl} width="100%" height="500px" title="Nómina" />
        </>
      ) : (
        <p>No tienes nóminas pendientes.</p>
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

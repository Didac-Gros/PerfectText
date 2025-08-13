import React, { useEffect, useState } from "react";
import { CallUI } from "./CallUI";
import { useAuth } from "../hooks/useAuth";

export default function CallPage() {
  const [me, setMe] = useState("aCVjI687ihbEwzaqF17WOBAiX2C2");       // userId
  const [jwt, setJwt] = useState("");     // token JWT
  const [target, setTarget] = useState("xeFQUxfKZuPnsYOvwaALHagl6Rj1"); // usuario al que llamar
  const { token } = useAuth();
  useEffect(() => {
    // Aquí puedes agregar la lógica que necesites para manejar los efectos secundarios
    console.log("Token JWT:", token);
  }, [token]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Demo de llamadas</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Mi userId"
          value={me}
          onChange={(e) => setMe(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="JWT"
          value={token!}
          onChange={(e) => setJwt(e.target.value)}
          style={{ width: "400px", marginRight: 8 }}
        />
        <input
          placeholder="Llamar a userId"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>

      {me && token && target && (
        <CallUI me={me} jwt={token!} targetUserId={target} />
      )}
    </div>
  );
}

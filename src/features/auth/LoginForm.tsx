'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";

// Se preferir instalar, pode usar a lib `jwt-decode`:
// import jwt_decode from "jwt-decode";

type JWTPayload = {
  nutriId: string;
  email: string;
  iat: number;
  exp: number;
};

export function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1) Faz login e recebe apenas o token
      const res = await api.post<{ token: string }>("/auth/login", {
        email,
        password: senha, // note: backend espera "password"
      });
      const { token } = res.data;

      // 2) Decodifica o payload do JWT para extrair o nutriId
      const [, payloadBase64] = token.split(".");
      const decoded = JSON.parse(
        decodeURIComponent(
          Array.prototype.map
            .call(atob(payloadBase64.replace(/_/g, "/").replace(/-/g, "+")), (c) =>
              "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
            )
            .join("")
        )
      ) as JWTPayload;
      const { nutriId } = decoded;

      // 3) Salva em localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("nutriId", nutriId);

      // 4) Configura no axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 5) Redireciona
      router.push("/dashboard");
    } 
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      console.error(err);
      alert("Erro no login. Verifique suas credenciais.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-10">
      <input
        className="w-full border rounded p-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="w-full border rounded p-2"
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />
      <Button type="submit" className="w-full">
        Entrar
      </Button>
    </form>
  );
}

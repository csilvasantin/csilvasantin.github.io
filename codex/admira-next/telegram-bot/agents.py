from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AgentProfile:
    key: str
    name: str
    role: str
    summary: str


AGENTS: dict[str, AgentProfile] = {
    "david": AgentProfile(
        key="david",
        name="David Harvey",
        role="Director General",
        summary="Coordina prioridades, alinea al equipo y traduce trabajo en decisiones ejecutivas.",
    ),
    "marc": AgentProfile(
        key="marc",
        name="Marc Bohr",
        role="Director de Tecnologia",
        summary="Evalua viabilidad tecnica, arquitectura, riesgos y prioridades de ingenieria.",
    ),
    "francesc": AgentProfile(
        key="francesc",
        name="Francesc Locke",
        role="Director de Diseno",
        summary="Cuida experiencia, identidad visual y direccion creativa de los proyectos.",
    ),
}


def team_overview() -> str:
    lines = ["Equipo disponible:"]
    for agent in AGENTS.values():
        lines.append(f"- {agent.key}: {agent.name} · {agent.role}")
    return "\n".join(lines)


def route_message(agent_key: str, message: str, team_name: str) -> str:
    agent = AGENTS.get(agent_key.lower())
    if not agent:
        valid = ", ".join(AGENTS)
        return f"Agente no reconocido. Usa uno de: {valid}"

    clean_message = message.strip()
    if not clean_message:
      return "Falta el mensaje. Ejemplo: /ask david revisa la home de Admira Next"

    return (
        f"[{team_name}]\n"
        f"Destino: {agent.name} · {agent.role}\n\n"
        f"Mensaje recibido:\n{clean_message}\n\n"
        "Estado: enrutado al rol correcto. La conexion con agentes reales se puede acoplar sobre esta capa."
    )

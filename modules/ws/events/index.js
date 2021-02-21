import Hooks from "../../../core/Hooks"
import onConnection from "./OnConnectionEvent";

export const WsEvents = () => {
    Hooks.add_action('io.onConnection', onConnection);
}
import Hooks from "../../../core/Hooks"
import onConnection from "./OnConnectionEvent";
import onMessageEvent from "./OnMessageEvent";

export const WsEvents = () => {
    Hooks.add_action('io.onConnection', onConnection);
    Hooks.add_action('io.onMessage', onMessageEvent);
}
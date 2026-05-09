package psihub.clients;

public record MySqlConnectionInfo(
        String productName,
        String productVersion,
        String url,
        String username,
        boolean valid
) {
}

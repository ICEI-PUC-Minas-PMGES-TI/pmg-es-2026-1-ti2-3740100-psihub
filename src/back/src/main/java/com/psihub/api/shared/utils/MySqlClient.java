package com.psihub.api.shared.utils;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.springframework.stereotype.Component;

@Component
public class MySqlClient {

    private static final int VALIDATION_TIMEOUT_SECONDS = 2;

    private final DataSource dataSource;

    public MySqlClient(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean isAvailable() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(VALIDATION_TIMEOUT_SECONDS);
        } catch (SQLException exception) {
            return false;
        }
    }

    public MySqlConnectionInfo getConnectionInfo() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();

            return new MySqlConnectionInfo(
                    metaData.getDatabaseProductName(),
                    metaData.getDatabaseProductVersion(),
                    metaData.getURL(),
                    metaData.getUserName(),
                    connection.isValid(VALIDATION_TIMEOUT_SECONDS)
            );
        } catch (SQLException exception) {
            throw new IllegalStateException("Nao foi possivel conectar ao MySQL", exception);
        }
    }
}


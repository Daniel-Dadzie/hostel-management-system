import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.util.Properties;

public class MavenWrapperDownloader {
  private static final String WRAPPER_PROPERTIES_PATH =
      ".mvn/wrapper/maven-wrapper.properties";
  private static final String WRAPPER_JAR_PATH = ".mvn/wrapper/maven-wrapper.jar";

  public static void main(String[] args) {
    try {
      Properties p = new Properties();
      try (InputStream in = Files.newInputStream(new File(WRAPPER_PROPERTIES_PATH).toPath())) {
        p.load(in);
      }
      String wrapperUrl = p.getProperty("wrapperUrl");
      if (wrapperUrl == null || wrapperUrl.isBlank()) {
        throw new IllegalStateException("wrapperUrl is not set");
      }

      File out = new File(WRAPPER_JAR_PATH);
      out.getParentFile().mkdirs();

      try (InputStream in = new URL(wrapperUrl).openStream();
          FileOutputStream fos = new FileOutputStream(out)) {
        byte[] buf = new byte[8192];
        int r;
        while ((r = in.read(buf)) != -1) {
          fos.write(buf, 0, r);
        }
      }
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
  }
}

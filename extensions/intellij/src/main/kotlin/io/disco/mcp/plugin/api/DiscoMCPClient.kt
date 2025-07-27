package io.disco.mcp.plugin.api

import com.google.gson.Gson
import com.google.gson.JsonObject
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * HTTP client for Disco MCP API
 */
class DiscoMCPClient(
    private val serverUrl: String,
    private val apiKey: String
) {
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()
    
    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()
    
    private var connected = false
    
    companion object {
        private const val API_BASE = "/api/v1"
    }
    
    /**
     * Test connection to MCP server
     */
    suspend fun connect(): Boolean {
        return try {
            val response = get("/auth/validate")
            connected = response.isSuccessful
            connected
        } catch (e: Exception) {
            connected = false
            false
        }
    }
    
    /**
     * Disconnect from server
     */
    fun disconnect() {
        connected = false
    }
    
    /**
     * Check if currently connected
     */
    fun isConnected(): Boolean = connected
    
    /**
     * List all containers
     */
    suspend fun listContainers(): List<Container> {
        val response = get("/containers")
        if (!response.isSuccessful) {
            throw IOException("Failed to list containers: ${response.code}")
        }
        
        val jsonBody = response.body?.string() ?: throw IOException("Empty response")
        val jsonObject = gson.fromJson(jsonBody, JsonObject::class.java)
        val containersArray = jsonObject.getAsJsonArray("containers")
        
        return containersArray.map { element ->
            gson.fromJson(element, Container::class.java)
        }
    }
    
    /**
     * Create a new container
     */
    suspend fun createContainer(name: String): Container {
        val requestBody = mapOf("name" to name)
        val response = post("/containers", requestBody)
        
        if (!response.isSuccessful) {
            throw IOException("Failed to create container: ${response.code}")
        }
        
        val jsonBody = response.body?.string() ?: throw IOException("Empty response")
        return gson.fromJson(jsonBody, Container::class.java)
    }
    
    /**
     * Delete a container
     */
    suspend fun deleteContainer(containerId: String): Boolean {
        val response = delete("/containers/$containerId")
        return response.isSuccessful
    }
    
    /**
     * Execute command in container
     */
    suspend fun executeCommand(containerId: String, command: String, workingDirectory: String? = null): CommandResult {
        val requestBody = mutableMapOf<String, Any>("command" to command)
        workingDirectory?.let { requestBody["workingDirectory"] = it }
        
        val response = post("/terminal/$containerId/execute", requestBody)
        
        if (!response.isSuccessful) {
            throw IOException("Failed to execute command: ${response.code}")
        }
        
        val jsonBody = response.body?.string() ?: throw IOException("Empty response")
        return gson.fromJson(jsonBody, CommandResult::class.java)
    }
    
    /**
     * List files in container directory
     */
    suspend fun listFiles(containerId: String, path: String = "/"): List<FileItem> {
        val response = get("/files/$containerId?path=$path")
        
        if (!response.isSuccessful) {
            throw IOException("Failed to list files: ${response.code}")
        }
        
        val jsonBody = response.body?.string() ?: throw IOException("Empty response")
        val jsonObject = gson.fromJson(jsonBody, JsonObject::class.java)
        val filesArray = jsonObject.getAsJsonArray("files")
        
        return filesArray.map { element ->
            gson.fromJson(element, FileItem::class.java)
        }
    }
    
    /**
     * Read file content from container
     */
    suspend fun readFile(containerId: String, path: String): String {
        val response = get("/files/$containerId/content?path=$path")
        
        if (!response.isSuccessful) {
            throw IOException("Failed to read file: ${response.code}")
        }
        
        val jsonBody = response.body?.string() ?: throw IOException("Empty response")
        val jsonObject = gson.fromJson(jsonBody, JsonObject::class.java)
        return jsonObject.get("content").asString
    }
    
    /**
     * Write file content to container
     */
    suspend fun writeFile(containerId: String, path: String, content: String): Boolean {
        val requestBody = mapOf(
            "path" to path,
            "content" to content
        )
        
        val response = post("/files/$containerId", requestBody)
        return response.isSuccessful
    }
    
    /**
     * Delete file from container
     */
    suspend fun deleteFile(containerId: String, path: String): Boolean {
        val response = delete("/files/$containerId?path=$path")
        return response.isSuccessful
    }
    
    /**
     * Get git status for container
     */
    suspend fun getGitStatus(containerId: String): GitStatus {
        val response = get("/git/$containerId/status")
        
        if (!response.isSuccessful) {
            throw IOException("Failed to get git status: ${response.code}")
        }
        
        val jsonBody = response.body?.string() ?: throw IOException("Empty response")
        return gson.fromJson(jsonBody, GitStatus::class.java)
    }
    
    // Private HTTP methods
    
    private suspend fun get(path: String): Response {
        val request = Request.Builder()
            .url("$serverUrl$API_BASE$path")
            .header("Authorization", "Bearer $apiKey")
            .build()
        
        return client.newCall(request).execute()
    }
    
    private suspend fun post(path: String, body: Any): Response {
        val json = gson.toJson(body)
        val requestBody = json.toRequestBody(jsonMediaType)
        
        val request = Request.Builder()
            .url("$serverUrl$API_BASE$path")
            .header("Authorization", "Bearer $apiKey")
            .post(requestBody)
            .build()
        
        return client.newCall(request).execute()
    }
    
    private suspend fun delete(path: String): Response {
        val request = Request.Builder()
            .url("$serverUrl$API_BASE$path")
            .header("Authorization", "Bearer $apiKey")
            .delete()
            .build()
        
        return client.newCall(request).execute()
    }
}

/**
 * Data classes for API responses
 */
data class Container(
    val id: String,
    val name: String,
    val status: String,
    val createdAt: String,
    val url: String? = null
)

data class CommandResult(
    val stdout: String,
    val stderr: String,
    val exitCode: Int
)

data class FileItem(
    val name: String,
    val type: String, // "file" or "directory"
    val path: String,
    val size: Long? = null,
    val lastModified: String? = null
)

data class GitStatus(
    val branch: String?,
    val ahead: Int,
    val behind: Int,
    val modified: List<String>,
    val staged: List<String>,
    val untracked: List<String>
)
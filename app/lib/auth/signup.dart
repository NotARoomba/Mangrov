import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mangrov/branding.dart';

class SignUp extends StatefulWidget {
  const SignUp({super.key});

  @override
  State<SignUp> createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {

  Branding br = Branding();

  Widget image(String image, double width) {
    return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 5.0),
                  child: ClipRRect(
                    borderRadius: BorderRadiusGeometry.circular(12),
                    child: Image.asset(image, fit: BoxFit.cover, width: width, height: 70,)),
                );
  }

  PageController controller = PageController();

  TextEditingController search = TextEditingController();

  List<String> myInterests = [];

  TextEditingController email = TextEditingController();
  TextEditingController password = TextEditingController();
  TextEditingController confirmPassword = TextEditingController();


  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: br.black,
        ),
        bottomNavigationBar: BottomAppBar(
          elevation: 0,
          color: br.black,
          child: Center(
            child: br.button(() {
              controller.nextPage(duration: Duration(milliseconds: 1000), curve: Curves.easeInOut);
            }, 'continue'),
          ),
        ),
        backgroundColor: br.black,
        body: PageView(
          controller: controller,
          children: [
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
            
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 0.0, vertical: 5),
                  child: SizedBox(
                    height: 70,
                    child: Row(
                      children: [
                         
                         image('lib/intro/jeans.jpeg', 100),
                         image('lib/intro/inspo.jpeg', 120),
                         image('lib/intro/matcha.jpeg', 50),
                         //image('lib/intro/soap.jpeg', 50),
                         Expanded(
                           child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 5.0),
                            child: ClipRRect(
                              borderRadius: BorderRadiusGeometry.circular(12),
                              child: Image.asset('lib/intro/soap.jpeg', fit: BoxFit.cover,)),
                                           ),
                         )
                  
                        
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 0.0, vertical: 5),
                  child: SizedBox(
                    height: 70,
                    child: Row(
                      children: [
                         
                         image('lib/intro/guacha.jpeg', 70),
                         image('lib/intro/board.jpeg', 120),
                         image('lib/intro/stick.jpeg', 50),
                         //image('lib/intro/soap.jpeg', 50),
                         Expanded(
                           child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 5.0),
                            child: ClipRRect(
                              borderRadius: BorderRadiusGeometry.circular(12),
                              child: Image.asset('lib/intro/silk.jpeg', fit: BoxFit.cover,)),
                                           ),
                         )
                  
                        
                      ],
                    ),
                  ),
                ),
            
                SizedBox(
                  height: 50,
                ),
            
                ListTile(
                  title: Text('Welcome to\nMangrov',
                  style: GoogleFonts.inter(
                    color: br.white,
                    fontSize: 30
                  ),
                  ),
                ),
            
                SizedBox(
                  height: 20,
                ),
            
                ListTile(
                  title: Text('A shopping experience designed by \nmeaningful, raw, human experiences.',
                  style: GoogleFonts.inter(
                    color: br.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w600
                  ),
                  ),
                ),
                SizedBox(
                  height: 10,
                ),
            
                ListTile(
                  title: Text('A thriving life for you. \nA sustainable future for all.',
                  style: GoogleFonts.inter(
                    color: br.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w600
                  ),
                  ),
                ),
            
            
              ],
            ),
      
            SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                    
                  ListTile(
                    title: Text("First, let's get to know you!",
                    style: GoogleFonts.inter(
                      color: br.white,
                      fontWeight: FontWeight.w500,
                      fontSize: 20
                    ),
                    ),
                    
                    subtitle: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Text("Insert some of your interests to help us customize your experience.",
                      style: GoogleFonts.inter(
                        color: br.white,
                        fontWeight: FontWeight.w500,
                        fontSize: 15
                      ),
                      ),
                    ),
                  ),
                    
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 20),
                    child: TextField(
                      controller: search,
                      cursorColor: Colors.green,
                      decoration: InputDecoration(
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: Colors.grey[800]!
                          ),
                        ),
                          
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: Colors.green
                          ),
                        ),
                          
                        prefixIcon: Icon(Icons.search),
                          
                        hintText: 'Search...',
                        hintStyle: GoogleFonts.inter(
                          color: br.grey,
                          fontSize: 14
                        )
                      ),
                    ),
                  ),
              
                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: br.interests.length,
                    itemBuilder: ((context, index) {
                  
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 5),
                        child: ListTile(
                          onTap: () {
                            
                            if (myInterests.contains(br.interests[index])) {
                              setState(() {
                                myInterests.remove(br.interests[index]);
                              });
                              
                            } else {
                              setState(() {
                                myInterests.add(br.interests[index]);
                              });
                              
                            }
                          },
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadiusGeometry.circular(12),
                            side: BorderSide(
                              color: myInterests.contains(br.interests[index]) ? Colors.green : Colors.transparent
                            )
                          ),
                          tileColor: const Color.fromARGB(255, 25, 24, 24),
                          title: Text(br.interests[index],
                          style: GoogleFonts.inter(
                            color: br.white,
                            fontSize: 14
                          ),
                          ),
                        ),
                      );
                    })
                  ),
                    
                ],
              ),
            ),

            // New column replicating the provided design
            SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(height: 60),
                  Container(
                    width: 130,
                    height: 130,
                    decoration: BoxDecoration(
                      color: Color(0xFF5DB075),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(18.0),
                      child: Image.asset('lib/logo.png'),
                    ),
                  ),
                  SizedBox(height: 40),
                 
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8),
                    child: TextField(
                      cursorColor: Colors.green,
                      controller: email,
                      enabled: true,                
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color.fromARGB(255, 27, 27, 27),
                        hintText: 'Email',
                        hintStyle: GoogleFonts.inter(
                          color: Colors.white,
                          //fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.white, width: 1.5),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.white, width: 1.5),
                        ),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                      ),
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8),
                    child: TextField(
                      controller: password,
                      enabled: true,
                      cursorColor: Colors.green,
                      obscureText: true,
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color.fromARGB(255, 27, 27, 27),
                        hintText: 'Password',
                        hintStyle: GoogleFonts.inter(
                          color: Colors.white,
                          //fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.white, width: 1.5),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.white, width: 1.5),
                        ),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                      ),
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  // Padding(
                  //   padding: const EdgeInsets.only(right: 20.0, top: 4),
                  //   child: Align(
                  //     alignment: Alignment.centerRight,
                  //     child: Text('Forgot password?',
                  //       style: GoogleFonts.inter(
                  //         color: Colors.white,
                  //         fontSize: 14,
                  //       ),
                  //     ),
                  //   ),
                  // ),

                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8),
                    child: TextField(
                      cursorColor: Colors.green,
                      controller: confirmPassword,
                      enabled: true,
                      obscureText: true,
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color.fromARGB(255, 27, 27, 27),
                        hintText: 'Confirm Password',
                        hintStyle: GoogleFonts.inter(
                          color: Colors.white,
                          //fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.white, width: 1.5),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.white, width: 1.5),
                        ),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                      ),
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                 


                  SizedBox(height: 30),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: () async {

                          try {
                            if (password.text != confirmPassword.text) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Passwords do not match'),
                                
                              ),
                            );
                          } else {
                            await FirebaseAuth.instance.createUserWithEmailAndPassword(
                              email: email.text, 
                              password: password.text
                            );
                          }
                          } catch (e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Something went wrong. Please try again.'),
                                
                              ),
                            );
                          }
                          
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Color(0xFF5DB075),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: Text('SIGN UP',
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 30),
                  Text('Or log in with',
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
            ),
      
          ],
        ),
      ),
    );
  }
}